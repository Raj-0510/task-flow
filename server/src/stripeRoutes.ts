import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "./db";
import { authMiddleware, AuthRequest } from "./authMiddleware";
import express from "express";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
const ENTERPRISE_PRICE_ID = process.env.STRIPE_ENTERPRISE_PRICE_ID!;

// ---------------------------------------------------------------------------
// POST /create-checkout-session  — start a Stripe Checkout for a plan
// ---------------------------------------------------------------------------
router.post(
    "/create-checkout-session",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.userId!;
            const { planId } = req.body;

            let priceId: string;
            if (planId === "pro") {
                priceId = PRO_PRICE_ID;
            } else if (planId === "enterprise") {
                priceId = ENTERPRISE_PRICE_ID;
            } else {
                return res.status(400).json({ error: "Invalid plan ID" });
            }

            // Find or create a Stripe customer linked to this user
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return res.status(404).json({ error: "User not found" });

            let subscription = await prisma.subscription.findUnique({
                where: { userId },
            });

            let customerId: string;

            if (subscription?.stripeCustomerId) {
                customerId = subscription.stripeCustomerId;
            } else {
                const customer = await stripe.customers.create({
                    email: user.email,
                    metadata: { userId },
                });
                customerId = customer.id;

                // Upsert so we store the customer ID even before checkout completes
                subscription = await prisma.subscription.upsert({
                    where: { userId },
                    update: { stripeCustomerId: customerId },
                    create: {
                        userId,
                        stripeCustomerId: customerId,
                        status: "inactive",
                    },
                });
            }

            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                mode: "payment",
                payment_method_types: ["card"],
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: `${CLIENT_URL}/pricing?success=true`,
                cancel_url: `${CLIENT_URL}/pricing?canceled=true`,
                metadata: { userId, priceId },
            });

            res.json({ url: session.url });
        } catch (err) {
            console.error("Checkout session error:", err);
            res.status(500).json({ error: "Failed to create checkout session" });
        }
    }
);

// ---------------------------------------------------------------------------
// POST /webhook  — Stripe sends events here (no auth, verified by signature)
// ---------------------------------------------------------------------------
router.post(
    "/webhook",
    async (req: Request, res: Response) => {
        console.log("🔔 Webhook hit! body type:", typeof req.body, Buffer.isBuffer(req.body) ? "is Buffer" : "NOT a Buffer");
        console.log("🔔 stripe-signature header:", req.headers["stripe-signature"] ? "PRESENT" : "MISSING");
        console.log("🔔 STRIPE_WEBHOOK_SECRET starts with:", process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 10));
        const sig = req.headers["stripe-signature"] as string;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body, // must be raw buffer — see index.ts middleware
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const rawSession = event.data.object as Stripe.Checkout.Session;

                // For one-time payments, we verify the payment was successful
                if (rawSession.payment_status === "paid") {
                    const customerId = rawSession.customer as string;

                    try {
                        const session = await stripe.checkout.sessions.retrieve(rawSession.id, {
                            expand: ['line_items']
                        });

                        const priceId = session.metadata?.priceId || session.line_items?.data[0]?.price?.id;

                        if (customerId && priceId) {
                            try {
                                await prisma.subscription.update({
                                    where: { stripeCustomerId: customerId },
                                    data: {
                                        status: "active",
                                        stripePriceId: priceId,
                                        // For one-time payments, these fields are not applicable
                                        stripeSubscriptionId: null,
                                        currentPeriodEnd: null,
                                    },
                                });
                                console.log(`Successfully updated subscription for ${customerId} with price ${priceId}`);
                            } catch (err) {
                                console.error("Failed to update subscription in DB:", err);
                            }
                        } else {
                            console.error(`Missing customerId (${customerId}) or priceId (${priceId}) in checkout session completed metadata`);
                        }
                    } catch (err) {
                        console.error("Failed to retrieve expanded session from Stripe:", err);
                    }
                } else {
                    console.error("Payment status was not paid:", rawSession.payment_status);
                }
                break;
            }
        }

        res.json({ received: true });
    }
);

// ---------------------------------------------------------------------------
// GET /subscription  — current user's subscription status
// ---------------------------------------------------------------------------
router.get(
    "/subscription",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { userId: req.userId! },
            });

            if (!subscription || subscription.status === "inactive") {
                return res.json({ plan: "free", status: "inactive" });
            }

            let planName = "free";
            if (subscription.stripePriceId === PRO_PRICE_ID) planName = "pro";
            else if (subscription.stripePriceId === ENTERPRISE_PRICE_ID)
                planName = "enterprise";

            res.json({
                plan: planName,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
            });
        } catch (err) {
            console.error("Get subscription error:", err);
            res.status(500).json({ error: "Failed to get subscription" });
        }
    }
);

// ---------------------------------------------------------------------------
// POST /create-portal-session  — Stripe Customer Portal (manage / cancel)
// ---------------------------------------------------------------------------
router.post(
    "/create-portal-session",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { userId: req.userId! },
            });

            if (!subscription?.stripeCustomerId) {
                return res.status(400).json({ error: "No subscription found" });
            }

            const portalSession = await stripe.billingPortal.sessions.create({
                customer: subscription.stripeCustomerId,
                return_url: `${CLIENT_URL}/pricing`,
            });

            res.json({ url: portalSession.url });
        } catch (err) {
            console.error("Portal session error:", err);
            res.status(500).json({ error: "Failed to create portal session" });
        }
    }
);

export default router;
