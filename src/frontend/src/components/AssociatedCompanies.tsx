import { useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { getApprovedCompanies } from "../lib/companies";

const POPPINS = "'Poppins', sans-serif";

export function AssociatedCompanies() {
  const navigate = useNavigate();
  const companies = getApprovedCompanies().slice(0, 3);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="mb-5" data-ocid="home.associated_companies">
      <h2
        style={{
          fontFamily: POPPINS,
          fontSize: "12px",
          fontWeight: 700,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "10px",
        }}
      >
        🏢 Associated Companies
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {companies.map((company, i) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.3 }}
            data-ocid={`home.company_card.${i + 1}`}
            onClick={() =>
              navigate({
                to: "/company/$companyId",
                params: { companyId: company.id },
              })
            }
            onMouseEnter={() => setHoveredId(company.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              background: "#ffffff",
              border: "1px solid #FFE0B2",
              borderLeft: company.isPremium
                ? "5px solid #F9A825"
                : "5px solid #FF6F00",
              borderRadius: "12px",
              padding: "14px",
              boxShadow:
                hoveredId === company.id
                  ? "0 4px 16px rgba(255,111,0,0.18)"
                  : "0 2px 8px rgba(255,111,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
            }}
          >
            {/* Logo */}
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "10px",
                background: company.logoBase64
                  ? "transparent"
                  : "linear-gradient(135deg, #FF6F00, #e53935)",
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
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  marginBottom: "3px",
                }}
              >
                {company.name}
              </div>
              {company.description && (
                <div
                  style={{
                    fontFamily: POPPINS,
                    fontSize: "11px",
                    color: "#FF6F00",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {company.description}
                </div>
              )}
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: "#FFF3E0",
                    color: "#E65100",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontFamily: POPPINS,
                  }}
                >
                  {company.type}
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  ✔ Verified
                </span>
                {company.isPremium && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>

            {/* View details arrow */}
            <div
              style={{
                alignSelf: "flex-end",
                color: "#FF6F00",
                fontFamily: POPPINS,
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              View →
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <button
          type="button"
          data-ocid="home.company_register_link"
          onClick={() => navigate({ to: "/company-register" })}
          style={{
            background: "none",
            border: "none",
            color: "#FF6F00",
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          📝 Register Your Company
        </button>
        <button
          type="button"
          data-ocid="home.companies_view_all_link"
          onClick={() => navigate({ to: "/companies" })}
          style={{
            background: "none",
            border: "none",
            color: "#FF6F00",
            fontFamily: POPPINS,
            fontWeight: 700,
            fontSize: "12px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          View All →
        </button>
      </div>
    </div>
  );
}
