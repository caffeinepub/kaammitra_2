import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Ban,
  CreditCard,
  MessageSquareWarning,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface ViolationNotificationBannerProps {
  visible: boolean;
  reason?: string;
  onDismiss: () => void;
  type: "blocked_post" | "blocked_profile" | "payment_alert" | "spam_detected";
}

const MESSAGES: Record<
  ViolationNotificationBannerProps["type"],
  { title: string; desc: string; color: string; icon: React.ReactNode }
> = {
  blocked_post: {
    title: "आपकी पोस्ट ब्लॉक की गई है",
    desc: "आपकी पोस्ट नीति उल्लंघन के कारण ब्लॉक की गई है। कृपया Community Guidelines का पालन करें।",
    color: "border-orange-300 bg-orange-50",
    icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
  },
  blocked_profile: {
    title: "आपका प्रोफाइल निलंबित है",
    desc: "आपका प्रोफाइल संदिग्ध गतिविधि के कारण निलंबित है। अधिक जानकारी के लिए Admin से संपर्क करें।",
    color: "border-red-300 bg-red-50",
    icon: <Ban className="h-4 w-4 text-red-600" />,
  },
  payment_alert: {
    title: "संदिग्ध भुगतान गतिविधि",
    desc: "संदिग्ध भुगतान गतिविधि का पता चला है। आपका खाता Admin समीक्षा के लिए फ्लैग किया गया है।",
    color: "border-yellow-300 bg-yellow-50",
    icon: <CreditCard className="h-4 w-4 text-yellow-700" />,
  },
  spam_detected: {
    title: "स्पैम संदेश पता चला",
    desc: "स्पैम संदेश का पता चला है। आपकी सामग्री स्वचालित रूप से block की गई है।",
    color: "border-purple-300 bg-purple-50",
    icon: <MessageSquareWarning className="h-4 w-4 text-purple-600" />,
  },
};

export function ViolationNotificationBanner({
  visible,
  reason,
  onDismiss,
  type,
}: ViolationNotificationBannerProps) {
  const msg = MESSAGES[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          <Alert className={`${msg.color} relative pr-10`}>
            {msg.icon}
            <AlertDescription className="text-xs">
              <strong className="block mb-0.5">{msg.title}</strong>
              {reason ?? msg.desc}
            </AlertDescription>
            <button
              type="button"
              data-ocid="violation_banner.dismiss.button"
              onClick={onDismiss}
              className="absolute top-2.5 right-2.5 p-1 rounded-full hover:bg-black/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
