import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <section className="pt-16">
      <div className="container-page max-w-lg pb-24 pt-20 text-center">
        <Suspense>
          <SuccessContent />
        </Suspense>
      </div>
    </section>
  );
}
