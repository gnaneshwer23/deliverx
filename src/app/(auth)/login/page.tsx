import Link from "next/link";
import { LoginForm } from "./login-form";
import { DxCaps } from "@/components/dx/dx-logo";
import {
  parseSuiteProduct,
  productDisplayName,
  productMarketingPath,
} from "@/lib/marketing/product-intent";
import { dxClass } from "@/lib/dx-theme";

type Search = Promise<{
  next?: string;
  reset?: string;
  error?: string;
  checkEmail?: string;
  product?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { next, reset, error, checkEmail, product: productParam } = await searchParams;
  const product = parseSuiteProduct(productParam);
  const signupHref = product
    ? `/signup?product=${encodeURIComponent(product)}`
    : "/signup";

  return (
    <div className="w-full max-w-[388px]">
      <h1 className={`${dxClass.display} text-[1.625rem] text-[#0D0D0B]`}>Welcome back</h1>
      <p className="mb-7 mt-1 text-[15px] font-light text-[#6B6B64]">
        {product
          ? `Sign in to continue with ${productDisplayName(product)}.`
          : "Sign in to your DeliverX workspace."}
      </p>

      {reset ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-sm text-[#1C4A2E]">
          Password updated. Sign in with your new password.
        </div>
      ) : null}

      {checkEmail ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-sm text-[#1C4A2E]">
          Check your email for a confirmation link. After confirming, sign in below to continue
          {product ? ` with ${productDisplayName(product)}` : " your personalised onboarding"}.
        </div>
      ) : null}

      {product && !checkEmail ? (
        <div className="mb-4 border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-2 text-xs text-[#1C4A2E]">
          Continuing <span className="font-semibold">{productDisplayName(product)}</span>
          {" · "}
          <Link
            href={productMarketingPath(product)}
            className="font-medium underline-offset-2 hover:underline"
          >
            Product page
          </Link>
        </div>
      ) : null}

      {error ? (
        <div
          className="mb-4 border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      ) : null}

      <LoginForm next={next} />

      <p className="mt-5 text-center text-sm text-[#6B6B64]">
        No account?{" "}
        <Link href={signupHref} className="font-medium text-[#1C4A2E] hover:underline">
          Create one
        </Link>
      </p>
      <DxCaps className="mt-8 block text-center text-xs text-[#4B5563]">
        Pilot access · No payment required
      </DxCaps>
    </div>
  );
}
