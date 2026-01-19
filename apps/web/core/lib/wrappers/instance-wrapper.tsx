import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { GOD_MODE_URL } from "@plane/constants";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
import { InstanceNotReady, MaintenanceView } from "@/components/instance";
// hooks
import { useInstance } from "@/hooks/store/use-instance";

type TInstanceWrapper = {
  children: ReactNode;
};

const InstanceWrapper = observer(function InstanceWrapper(props: TInstanceWrapper) {
  const { children } = props;
  // store
  const { isLoading, instance, error, fetchInstanceInfo } = useInstance();
  const [isRedirectingToAdmin, setIsRedirectingToAdmin] = useState(false);

  const { isLoading: isInstanceSWRLoading, error: instanceSWRError } = useSWR(
    "INSTANCE_INFORMATION",
    async () => await fetchInstanceInfo(),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (instance?.is_setup_done === false && typeof window !== "undefined") {
      setIsRedirectingToAdmin(true);
      const fallback = "/god-mode/";
      const target = GOD_MODE_URL || fallback;
      if (!window.location.pathname.startsWith("/god-mode")) {
        window.location.assign(target);
      }
    }
  }, [instance?.is_setup_done]);

  // loading state
  if ((isLoading || isInstanceSWRLoading) && !instance)
    return (
      <div className="relative flex h-screen w-full items-center justify-center">
        <LogoSpinner />
      </div>
    );

  if (instanceSWRError) return <MaintenanceView />;

  // something went wrong while in the request
  if (error && error?.status === "error") return <>{children}</>;

  // instance is not ready and setup is not done
  if (instance?.is_setup_done === false) return isRedirectingToAdmin ? null : <InstanceNotReady />;

  return <>{children}</>;
});

export default InstanceWrapper;
