import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  IndianRupee,
  Info,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const WAGE_TABLE = [
  {
    category: "Unskilled (अकुशल)",
    daily: "₹783",
    monthly: "₹20,358",
    badge: "basic",
  },
  {
    category: "Semi-Skilled (अर्ध-कुशल)",
    daily: "₹868",
    monthly: "₹22,568",
    badge: "semi",
  },
  {
    category: "Skilled (कुशल)",
    daily: "₹954",
    monthly: "₹24,804",
    badge: "skilled",
  },
  {
    category: "Highly Skilled (उच्च कुशल)",
    daily: "₹1,035",
    monthly: "₹26,910",
    badge: "high",
  },
];

const badgeColors: Record<string, string> = {
  basic: "bg-slate-100 text-slate-700 border-slate-200",
  semi: "bg-blue-100 text-blue-700 border-blue-200",
  skilled: "bg-emerald-100 text-emerald-700 border-emerald-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
};

export function MinWage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[oklch(0.35_0.12_145)] to-[oklch(0.28_0.10_145)] text-white">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 mb-4"
            data-ocid="minwage.back_button"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> वापस
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🇮🇳</span>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                Ministry of Labour & Employment
              </Badge>
            </div>
            <h1 className="text-2xl font-bold leading-tight mt-2">
              सरकारी न्यूनतम मजदूरी
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Government Minimum Wage – India
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-10 space-y-4">
        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-sm border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  यह जानकारी भारत सरकार के{" "}
                  <span className="font-semibold">
                    Ministry of Labour &amp; Employment
                  </span>{" "}
                  द्वारा जारी आधिकारिक{" "}
                  <span className="font-semibold">
                    Minimum Wage Notification
                  </span>{" "}
                  पर आधारित है।
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Update Schedule Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card
            className="shadow-sm border-border"
            data-ocid="minwage.april_card"
          >
            <CardContent className="pt-4 pb-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
              <p className="text-xs text-muted-foreground mb-1">अगला अपडेट</p>
              <p className="font-bold text-lg text-foreground">1 April</p>
              <p className="text-xs text-muted-foreground">हर साल</p>
            </CardContent>
          </Card>
          <Card
            className="shadow-sm border-border"
            data-ocid="minwage.october_card"
          >
            <CardContent className="pt-4 pb-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-muted-foreground mb-1">और फिर</p>
              <p className="font-bold text-lg text-foreground">1 October</p>
              <p className="text-xs text-muted-foreground">हर साल</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CPI + VDA Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-sm border-border bg-blue-50/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">
                    CPI + VDA आधारित मजदूरी
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    यह मजदूरी{" "}
                    <span className="font-medium text-foreground">
                      CPI (महंगाई सूचकांक)
                    </span>{" "}
                    के आधार पर{" "}
                    <span className="font-medium text-foreground">
                      Variable Dearness Allowance (VDA)
                    </span>{" "}
                    जोड़कर तय की जाती है।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wage Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="shadow-sm border-border" data-ocid="minwage.table">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
                न्यूनतम दैनिक मजदूरी (सांकेतिक)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                अक्टूबर 2024 – मार्च 2025 की अनुमानित दरें
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">श्रेणी</TableHead>
                    <TableHead className="text-xs text-right">दैनिक</TableHead>
                    <TableHead className="text-xs text-right">मासिक</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WAGE_TABLE.map((row, i) => (
                    <TableRow
                      key={row.badge}
                      data-ocid={`minwage.table.row.${i + 1}`}
                    >
                      <TableCell className="py-2">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${
                            badgeColors[row.badge]
                          }`}
                        >
                          {row.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-emerald-700 py-2">
                        {row.daily}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground py-2">
                        {row.monthly}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-3 flex gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <Info className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  ये दरें सांकेतिक हैं। नवीनतम और सटीक दरों के लिए नीचे दिए गए आधिकारिक
                  स्रोत पर जाएं।
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Official Source */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="shadow-sm border-emerald-200 bg-emerald-50/60"
            data-ocid="minwage.source_card"
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏛️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Official Source
                  </p>
                  <p className="font-semibold text-sm text-foreground">
                    Chief Labour Commissioner (Central)
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ministry of Labour &amp; Employment, Govt. of India
                  </p>
                  <a
                    href="https://clc.gov.in/clc/min-wages"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid="minwage.official_link"
                  >
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                      size="sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      आधिकारिक Notification देखें
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* State Note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card
            className="shadow-sm border-orange-200 bg-orange-50/60"
            data-ocid="minwage.state_note"
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-800 mb-1">
                    महत्वपूर्ण नोट
                  </p>
                  <p className="text-sm text-orange-900 leading-relaxed">
                    राज्य सरकारें अपने राज्य के लिए अलग Minimum Wage तय कर सकती हैं,
                    लेकिन वह{" "}
                    <span className="font-bold">National Floor Wage</span> से कम
                    नहीं हो सकती।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator />

        {/* Footer note */}
        <p className="text-xs text-center text-muted-foreground pb-2">
          © {new Date().getFullYear()} ·{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
