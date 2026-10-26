import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";
import { LATEST_APP_DOWNLOAD_URL, syncStripeSubscription } from "@/lib/server/stripe-billing";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }
  try {
    if (event.type === "checkout.session.completed") {
      await handleCompletedCheckout(stripe, event.data.object as Stripe.Checkout.Session);
    } else if ([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ].includes(event.type)) {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Falha no evento Stripe ${event.id}:`, error);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}

async function handleCompletedCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode === "subscription" && session.subscription) {
    const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    await syncStripeSubscription(await stripe.subscriptions.retrieve(id), session.metadata?.userId);
    await sendSubscriptionWelcome(session);
  }
}

async function sendSubscriptionWelcome(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  if (!resend || !email) return;
  await resend.emails.send({
    from: "RIESCADE <noreply@riescade.com.br>",
    to: email,
    subject: "Sua assinatura RIESCADE está ativa",
    html: `<h1>Bem-vindo à RIESCADE!</h1>
      <p>Sua assinatura está ativa. Para começar:</p>
      <ol>
        <li><a href="${LATEST_APP_DOWNLOAD_URL}">Baixe a versão mais recente do RIESCADE</a>.</li>
        <li>Extraia o arquivo e abra o aplicativo.</li>
        <li>Faça login com a mesma conta Google usada na assinatura.</li>
        <li>Escolha um jogo no catálogo e comece a jogar.</li>
      </ol>
      <p>O link sempre baixa a versão mais recente publicada.</p>`,
  });
}
