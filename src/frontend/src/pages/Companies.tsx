import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Building2, ChevronLeft, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { getApprovedCompanies, searchCompanies } from "../lib/companies";
import type { CompanyType } from "../lib/companies";

const POPPINS = "'Poppins', sans-serif";

const TYPE_FILTERS: Array<CompanyType | "All"> = [
  "All",
  "Pvt Ltd",
  "Contractor",
  "Builder",
  "Developer",
];

export function Companies() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CompanyType | "All">("All");

  const allApproved = getApprovedCompanies();
  const filtered =
    query.trim() || typeFilter !== "All"
      ? searchCompanies(query, typeFilter !== "All" ? typeFilter : undefined)
      : allApproved;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fff8f0",
        fontFamily: POPPINS,
      }}
      className="pb-28"
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg,#FF6F00,#e53935)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          data-ocid="companies.back_button"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span style={{ color: "#fff", fontSize: "17px", fontWeight: 800 }}>
          🏢 Companies
        </span>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
          <Input
            data-ocid="companies.search_input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company, location, type search karein..."
            style={{
              paddingLeft: "36px",
              fontFamily: POPPINS,
              borderColor: "#FFE0B2",
            }}
          />
        </div>

        {/* Type filter chips */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            marginBottom: "12px",
          }}
        >
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              data-ocid={`companies.filter_${t.toLowerCase().replace(/ /g, "_")}.tab`}
              onClick={() => setTypeFilter(t as CompanyType | "All")}
              style={{
                background: typeFilter === t ? "#FF6F00" : "#fff",
                color: typeFilter === t ? "#fff" : "#E65100",
                border: "1.5px solid #FF6F00",
                borderRadius: "20px",
                padding: "5px 14px",
                fontFamily: POPPINS,
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {t === "All" ? "All Types" : t}
            </button>
          ))}
        </div>

        {/* Register button */}
        <button
          type="button"
          data-ocid="companies.register_button"
          onClick={() => navigate({ to: "/company-register" })}
          style={{
            width: "100%",
            background: "linear-gradient(90deg,#FF6F00,#e53935)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "14px",
            boxShadow: "0 4px 14px rgba(255,111,0,0.25)",
          }}
        >
          📝 Register Your Company
        </button>

        {/* Stats bar */}
        <div
          style={{
            background: "#FFF3E0",
            border: "1px solid #FFE0B2",
            borderRadius: "10px",
            padding: "8px 14px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Building2 className="w-4 h-4 text-orange-500" />
          <span
            style={{
              fontFamily: POPPINS,
              fontSize: "13px",
              fontWeight: 700,
              color: "#E65100",
            }}
          >
            {allApproved.length} Verified Companies
          </span>
        </div>

        {/* Company cards */}
        {filtered.length === 0 ? (
          <div
            data-ocid="companies.empty_state"
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#888",
              fontFamily: POPPINS,
              fontSize: "14px",
            }}
          >
            <Building2 className="w-12 h-12 text-orange-200 mx-auto mb-4" />
            Koi company nahi mili. Pehli company register karein!
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filtered.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                data-ocid={`companies.item.${i + 1}`}
                onClick={() =>
                  navigate({
                    to: "/company/$companyId",
                    params: { companyId: company.id },
                  })
                }
                style={{
                  background: "#fff",
                  border: "1px solid #FFE0B2",
                  borderLeft: company.isPremium
                    ? "5px solid #F9A825"
                    : "5px solid #FF6F00",
                  borderRadius: "16px",
                  padding: "14px",
                  boxShadow: "0 2px 10px rgba(255,111,0,0.07)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
              >
                {/* Logo */}
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "10px",
                    background: company.logoBase64
                      ? "transparent"
                      : "linear-gradient(135deg,#FF6F00,#e53935)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {company.logoBase64 ? (
                    <img
                      src={company.logoBase64}
                      alt={company.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: POPPINS,
                      fontWeight: 800,
                      fontSize: "14px",
                      color: "#1a1a1a",
                      marginBottom: "4px",
                    }}
                  >
                    {company.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      marginBottom: "6px",
                    }}
                  >
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                      ✔ Verified Company
                    </span>
                    {company.isPremium && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        ⭐ Premium
                      </span>
                    )}
                    <span
                      style={{
                        background: "#FFF3E0",
                        color: "#E65100",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontFamily: POPPINS,
                      }}
                    >
                      {company.type}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span
                      style={{
                        fontFamily: POPPINS,
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      {company.location}
                    </span>
                  </div>
                  {company.description && (
                    <p
                      style={{
                        fontFamily: POPPINS,
                        fontSize: "12px",
                        color: "#555",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        marginBottom: "8px",
                      }}
                    >
                      {company.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`https://wa.me/91${company.contactPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      data-ocid={`companies.contact_button.${i + 1}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "#25D366",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontFamily: POPPINS,
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      📞 Contact
                    </a>
                    <button
                      type="button"
                      data-ocid={`companies.view_jobs_button.${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                          to: "/company/$companyId",
                          params: { companyId: company.id },
                        });
                      }}
                      style={{
                        background: "#FF6F00",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontFamily: POPPINS,
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      View Jobs
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
