import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  ExternalLink,
  HelpCircle,
  Info,
  LogOut,
  MessageSquare,
  Phone,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getMyExtendedProfile } from "../lib/constants";

interface MainMenuProps {
  open: boolean;
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    q: "App kaise use karein?",
    a: 'Pehle "Apni Profile Banayein" par jaayein, form bharen, aur payment ke baad aapka profile activate ho jaayega. Phir contractors aapko directly contact kar sakte hain.',
  },
  {
    q: "Payment nahi mili?",
    a: "Payment Complaint section mein jaayein, form bharen aur proof upload karein. Admin 24-48 ghante mein review karega. Escrow system ke zariye payment secure rahti hai.",
  },
  {
    q: "Profile verify kaise karein?",
    a: '"Verified Badge le" option mein jaayein. Aadhaar / Voter ID / Driving License upload karein aur ₹99 payment karein. Verification 1-2 working days mein complete hoti hai.',
  },
  {
    q: "Worker kaise dhundhe?",
    a: '"Worker Dhundho" section mein jaayein, category aur location filter karein. Map view se nearby workers bhi dekh sakte hain.',
  },
];

export function MainMenu({ open, onClose }: MainMenuProps) {
  const navigate = useNavigate();
  const myProfile = getMyExtendedProfile();
  const isAdmin = !!localStorage.getItem("kaam_mitra_admin_session");

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("kaam_mitra_notif_prefs");
      return stored
        ? JSON.parse(stored)
        : {
            jobAlerts: true,
            messages: true,
            community: true,
            emergency: true,
            payment: true,
          };
    } catch {
      return {
        jobAlerts: true,
        messages: true,
        community: true,
        emergency: true,
        payment: true,
      };
    }
  });

  function updateNotif(key: string, value: boolean) {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    localStorage.setItem("kaam_mitra_notif_prefs", JSON.stringify(updated));
  }

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");

  function submitFeedback() {
    if (!feedbackRating) {
      toast.error("Rating zaroor dein");
      return;
    }
    const feedbacks = JSON.parse(
      localStorage.getItem("kaam_mitra_feedbacks") || "[]",
    );
    feedbacks.push({
      rating: feedbackRating,
      comment: feedbackComment,
      date: new Date().toISOString(),
    });
    localStorage.setItem("kaam_mitra_feedbacks", JSON.stringify(feedbacks));
    setFeedbackRating(0);
    setFeedbackComment("");
    toast.success("Feedback bhej diya! Shukriya 🙏");
  }

  const [ticketName, setTicketName] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");

  function submitTicket() {
    if (!ticketMsg.trim()) {
      toast.error("Message likhein");
      return;
    }
    const tickets = JSON.parse(
      localStorage.getItem("kaam_mitra_tickets") || "[]",
    );
    tickets.push({
      name: ticketName,
      message: ticketMsg,
      date: new Date().toISOString(),
    });
    localStorage.setItem("kaam_mitra_tickets", JSON.stringify(tickets));
    setTicketName("");
    setTicketMsg("");
    toast.success("Ticket submit ho gaya! Hum jald contact karenge.");
  }

  const [logoutConfirm, setLogoutConfirm] = useState(false);

  function doLogout() {
    localStorage.removeItem("kaam_mitra_my_extended");
    localStorage.removeItem("workerProfile");
    localStorage.removeItem("contractorProfile");
    localStorage.removeItem("kaam_mitra_admin_session");
    onClose();
    navigate({ to: "/" });
    toast.success("Logout ho gaya. Phir milenge! 👋");
  }

  function goTo(path: string) {
    onClose();
    navigate({ to: path as "/" });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="main_menu.sheet"
        side="right"
        className="w-full sm:w-[380px] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <SheetTitle className="font-display font-black text-xl flex items-center gap-2">
            <span className="text-2xl">🇮🇳</span> KaamMitra Menu
          </SheetTitle>
          {myProfile && (
            <p className="text-sm text-muted-foreground">
              👤{" "}
              {myProfile.city ? `${myProfile.city} Worker` : "KaamMitra User"}·{" "}
              {myProfile.mobile}
            </p>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1">
          <Accordion type="multiple" className="px-3 pt-2 pb-6 space-y-1">
            {/* 1. Profile */}
            <AccordionItem
              value="profile"
              data-ocid="main_menu.profile.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-green-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Profile
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2 pt-1">
                  <MenuLink
                    label="👤 Profile Banayein / Edit"
                    onClick={() => goTo("/create-profile")}
                  />
                  <MenuLink
                    label="✅ Verified Badge le"
                    onClick={() => goTo("/verify-and-pay")}
                  />
                  <MenuLink
                    label="🪪 Digital ID Card"
                    onClick={() => goTo("/worker-id-card")}
                  />
                  <MenuLink
                    label="📄 Document Upload"
                    onClick={() => goTo("/worker-verification")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Job Settings */}
            <AccordionItem
              value="job_settings"
              data-ocid="main_menu.job_settings.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Job Settings
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2 pt-1">
                  <MenuLink
                    label="📍 Nearby Jobs"
                    onClick={() => goTo("/nearby-jobs")}
                  />
                  <MenuLink
                    label="🔍 Kaam Dhundho"
                    onClick={() => goTo("/find-work")}
                  />
                  <MenuLink
                    label="👷 Worker Dhundho"
                    onClick={() => goTo("/find-worker")}
                  />
                  <MenuLink
                    label="👩 Female Hub"
                    onClick={() => goTo("/female-hub")}
                  />
                  <MenuLink
                    label="🤖 Mitra AI Assistant"
                    onClick={() => goTo("/mitra-ai")}
                  />
                  <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mt-2">
                    📏 Distance Filter: 5KM / 10KM / 25KM / 50KM
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Operator Ekta */}
            <AccordionItem
              value="operator_ekta"
              data-ocid="main_menu.operator_ekta.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-orange-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Operator Ekta
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2 pt-1">
                  <MenuLink
                    label="📋 Operator Rate Card"
                    onClick={() => goTo("/operator-poster")}
                  />
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs font-semibold text-orange-800 mb-1">
                      🤝 State Groups
                    </p>
                    <p className="text-xs text-orange-700 leading-relaxed">
                      UP · Bihar · Delhi · Rajasthan · Punjab · Haryana ·
                      Maharashtra
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Apne state ke group mein join karein aur operators se
                      connect karein.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = encodeURIComponent(
                        "KaamMitra App par join karein – India ka sabse bada labour marketplace! https://kaammitra.app",
                      );
                      window.open(`https://wa.me/?text=${msg}`, "_blank");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors mt-1"
                  >
                    <span>💬</span> WhatsApp par Share karein
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Payment Complaint */}
            <AccordionItem
              value="payment_complaint"
              data-ocid="main_menu.payment_complaint.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Payment Complaint
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2 pt-1">
                  <MenuLink
                    label="⚠️ Payment Complaint Karein"
                    onClick={() => goTo("/payment-history")}
                  />
                  <MenuLink
                    label="🔒 Escrow / Advance"
                    onClick={() => goTo("/escrow")}
                  />
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs font-semibold text-red-800 mb-1">
                      🚫 Blacklist Contractor
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Agar contractor ne payment nahi di, toh complaint form
                      bharen. Verify hone ke baad unka naam warning list mein
                      add hoga taaki dusre workers savdhan rahein.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Government Rules */}
            <AccordionItem
              value="government_rules"
              data-ocid="main_menu.government_rules.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Government Rules
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2 pt-1">
                  <MenuLink
                    label="⚖️ न्यूनतम मजदूरी"
                    onClick={() => goTo("/min-wage")}
                  />
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      Minimum Wage हर साल <strong>April</strong> और{" "}
                      <strong>October</strong> में update होती है। Ministry of
                      Labour &amp; Employment द्वारा जारी।
                    </p>
                  </div>
                  <a
                    href="https://clc.gov.in/clc/min-wages"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Official CLC Website खोलें
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Notifications */}
            <AccordionItem
              value="notifications"
              data-ocid="main_menu.notifications.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-yellow-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Notifications
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-2">
                  <NotifToggle
                    label="Job Alerts"
                    icon="💼"
                    value={notifPrefs.jobAlerts}
                    onChange={(v) => updateNotif("jobAlerts", v)}
                    ocid="main_menu.notifications.job_alerts.switch"
                  />
                  <NotifToggle
                    label="Message Notifications"
                    icon="💬"
                    value={notifPrefs.messages}
                    onChange={(v) => updateNotif("messages", v)}
                    ocid="main_menu.notifications.messages.switch"
                  />
                  <NotifToggle
                    label="Community Updates"
                    icon="👥"
                    value={notifPrefs.community}
                    onChange={(v) => updateNotif("community", v)}
                    ocid="main_menu.notifications.community.switch"
                  />
                  <NotifToggle
                    label="Emergency Alerts"
                    icon="🚨"
                    value={notifPrefs.emergency}
                    onChange={(v) => updateNotif("emergency", v)}
                    ocid="main_menu.notifications.emergency.switch"
                  />
                  <NotifToggle
                    label="Payment Alerts"
                    icon="💰"
                    value={notifPrefs.payment}
                    onChange={(v) => updateNotif("payment", v)}
                    ocid="main_menu.notifications.payment.switch"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Help & Support */}
            <AccordionItem
              value="help_support"
              data-ocid="main_menu.help_support.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-teal-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Help &amp; Support
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                    FAQ
                  </p>
                  <Accordion type="single" collapsible className="space-y-1">
                    {FAQ_ITEMS.map((item) => (
                      <AccordionItem
                        key={item.q}
                        value={item.q}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-muted/40">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-2 text-xs text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <p className="text-xs font-bold text-foreground uppercase tracking-wide pt-1">
                    Support Ticket
                  </p>
                  <input
                    type="text"
                    placeholder="Aapka naam"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Textarea
                    placeholder="Kya problem hai? Detail mein likhein..."
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    className="text-xs min-h-[70px] resize-none"
                  />
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={submitTicket}
                    data-ocid="main_menu.help_support.submit_button"
                  >
                    Submit Ticket
                  </Button>

                  <p className="text-xs font-bold text-foreground uppercase tracking-wide pt-1">
                    Emergency Helpline
                  </p>
                  <div className="space-y-1.5">
                    <a
                      href="tel:155214"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> 155214 – Govt Labour
                      Helpline
                    </a>
                    <a
                      href="tel:112"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> 112 – Emergency
                    </a>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 8. About App */}
            <AccordionItem
              value="about_app"
              data-ocid="main_menu.about_app.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-purple-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    About App
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
                    <span className="text-xs text-muted-foreground">
                      Version
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      1.0.0
                    </span>
                  </div>
                  <AboutSection
                    title="Terms & Conditions"
                    content="KaamMitra app ka use karte waqt users ko platform ke rules follow karne honge. Galat ya jhoothi information dena, fake job post karna, kisi worker ya employer ko dhokha dena mana hai. Payment dispute hone par complaint system ka use karein."
                  />
                  <AboutSection
                    title="Privacy Policy"
                    content="KaamMitra aapki personal information ko secure rakhta hai. User ke mobile number, documents aur profile data ko bina permission kisi third party ke saath share nahi kiya jayega. User apne privacy settings ko kabhi bhi change kar sakta hai."
                  />
                  <AboutSection
                    title="Community Guidelines"
                    content="KaamMitra community mein sabhi users ko respect ke saath baat karni hogi. Abuse ya harassment mana hai. Fake complaint mana hai. Fraud ya scam report karna zaroori hai."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 9. Feedback */}
            <AccordionItem
              value="feedback"
              data-ocid="main_menu.feedback.panel"
              className="rounded-xl border border-border overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-pink-700" />
                  </span>
                  <span className="font-semibold text-sm text-foreground">
                    Feedback
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Aapka experience kaisa raha? Rating dein:
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95"
                        aria-label={`${star} star`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= feedbackRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Koi sujhav ya comment..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="text-xs min-h-[70px] resize-none"
                    data-ocid="main_menu.feedback.textarea"
                  />
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={submitFeedback}
                    data-ocid="main_menu.feedback.submit_button"
                  >
                    Feedback Bhejein 🙏
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 10. Logout */}
            <AccordionItem
              value="logout"
              data-ocid="main_menu.logout.panel"
              className="rounded-xl border border-red-200 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </span>
                  <span className="font-semibold text-sm text-red-600">
                    Logout
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                {!logoutConfirm ? (
                  <div className="pt-2 space-y-3">
                    <p className="text-sm text-foreground font-medium">
                      Kya aap logout karna chahte hain?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aapka session aur saved data clear ho jayega.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setLogoutConfirm(true)}
                    >
                      Haan, Logout Karein
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    <p className="text-sm font-semibold text-red-700">
                      ⚠️ Pakka logout karein?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={doLogout}
                        data-ocid="main_menu.logout.confirm_button"
                      >
                        Haan, Logout
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setLogoutConfirm(false)}
                        data-ocid="main_menu.logout.cancel_button"
                      >
                        Nahi, Wapas
                      </Button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* 11. Admin Panel – only for admins */}
            {isAdmin && (
              <AccordionItem
                value="admin_panel"
                data-ocid="main_menu.admin_panel.panel"
                className="rounded-xl border border-amber-300 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-amber-700" />
                    </span>
                    <span className="font-semibold text-sm text-amber-700">
                      Admin Panel
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2 pt-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-2">
                      <p className="text-xs text-amber-700 font-medium">
                        🔒 Admin-only access
                      </p>
                    </div>
                    <MenuLink
                      label="🛡️ Admin Dashboard"
                      onClick={() => goTo("/admin")}
                    />
                    <MenuLink
                      label="🤖 AI Moderation"
                      onClick={() => goTo("/ai-moderation")}
                    />
                    <MenuLink
                      label="🚩 Flagged Content"
                      onClick={() => goTo("/admin")}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MenuLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium"
    >
      {label}
    </button>
  );
}

function NotifToggle({
  label,
  icon,
  value,
  onChange,
  ocid,
}: {
  label: string;
  icon: string;
  value: boolean;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <Switch checked={value} onCheckedChange={onChange} data-ocid={ocid} />
    </div>
  );
}

function AboutSection({ title, content }: { title: string; content: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        {title}
        <span className="text-muted-foreground">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
