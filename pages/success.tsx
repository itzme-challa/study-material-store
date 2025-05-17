import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();
  const { link } = router.query;

  useEffect(() => {
    if (link) {
      window.location.href = link as string;
    }
  }, [link]);

  return <p>Redirecting to your product...</p>;
}
