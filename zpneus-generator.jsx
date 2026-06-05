import { useState, useRef, useEffect, useCallback } from "react";
import logoPng from "./assets/logo.png";

const DEFAULT_VALUES = {
  note: "9",
  saison: "ÉTÉ",
  dimension: "205/55 R16 91V",
  prix: "49",
};

export default function ZPneusGenerator() {
  const [bgImage, setBgImage] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBgPreview(e.target.result);
      const img = new Image();
      img.onload = () => setBgImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    if (bgImage) {
      // Cover-fit the user image (top portion)
      const imgRatio = bgImage.width / bgImage.height;
      const targetH = H * 0.72;
      const targetW = W;
      let drawW, drawH, offsetX, offsetY;
      if (imgRatio > targetW / targetH) {
        drawH = targetH;
        drawW = drawH * imgRatio;
        offsetX = (targetW - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = targetW;
        drawH = drawW / imgRatio;
        offsetX = 0;
        offsetY = (targetH - drawH) / 2;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, targetH);
      ctx.clip();
      ctx.drawImage(bgImage, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      // Dark gradient overlay on photo
      const grad = ctx.createLinearGradient(0, 0, 0, targetH);
      grad.addColorStop(0, "rgba(0,0,0,0.35)");
      grad.addColorStop(0.6, "rgba(0,0,0,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, targetH);
    }

    // ── LOGO AREA ──
    const logoY = 72;
    // Red circle with tire icon (simplified SVG-like)
    ctx.save();
    ctx.beginPath();
    ctx.arc(88, logoY + 28, 38, 0, Math.PI * 2);
    ctx.fillStyle = "#CC1418";
    ctx.fill();
    // Tire lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(88, logoY + 28, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(88, logoY + 28, 10, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(88 + Math.cos(angle) * 10, logoY + 28 + Math.sin(angle) * 10);
      ctx.lineTo(88 + Math.cos(angle) * 22, logoY + 28 + Math.sin(angle) * 22);
      ctx.stroke();
    }
    ctx.restore();

    // Z-PNEUS text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 58px 'Arial Black', Arial";
    ctx.fillText("Z-PNEUS", 140, logoY + 32);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#CCCCCC";
    ctx.fillText("neufs & occasions", 140, logoY + 60);

    // ── NOTE BADGE (top right) ──
    const badgeX = W - 155;
    const badgeY = logoY - 8;
    const badgeW = 140;
    const badgeH = 80;
    // Red parallelogram
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(badgeX + 16, badgeY);
    ctx.lineTo(badgeX + badgeW, badgeY);
    ctx.lineTo(badgeX + badgeW - 0, badgeY + badgeH);
    ctx.lineTo(badgeX, badgeY + badgeH);
    ctx.closePath();
    ctx.fillStyle = "#CC1418";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px 'Arial Black', Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${values.note}/10`, badgeX + badgeW / 2 + 6, badgeY + 54);
    ctx.textAlign = "left";
    ctx.restore();

    // ── FEATURE LIST ──
    const features = [
      { icon: "⚙", title: "GRAND CHOIX", sub: "Toutes dimensions" },
      { icon: "✓", title: "QUALITÉ CONTRÔLÉE", sub: "Pneus vérifiés" },
      { icon: "🔧", title: "MONTAGE & ÉQUILIBRAGE", sub: "Inclus" },
      { icon: "🚚", title: "STOCK DISPONIBLE", sub: "Prêt à partir !" },
    ];

    let fy = 215;
    features.forEach((f) => {
      // Red circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(62, fy + 20, 26, 0, Math.PI * 2);
      ctx.fillStyle = "#CC1418";
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(f.icon, 62, fy + 27);
      ctx.textAlign = "left";
      ctx.restore();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px 'Arial Black', Arial";
      ctx.fillText(f.title, 102, fy + 18);
      ctx.fillStyle = "#BBBBBB";
      ctx.font = "22px Arial";
      ctx.fillText(f.sub, 102, fy + 44);

      // Separator line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, fy + 62);
      ctx.lineTo(W - 60, fy + 62);
      ctx.stroke();

      fy += 76;
    });

    // ── BOTTOM CARD ──
    const cardY = H - 340;
    const cardH = 230;
    const radius = 22;

    // White left portion
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(40 + radius, cardY);
    ctx.lineTo(W - 40, cardY);
    ctx.lineTo(W - 40, cardY + cardH);
    ctx.lineTo(40 + radius, cardY + cardH);
    ctx.arcTo(40, cardY + cardH, 40, cardY + cardH - radius, radius);
    ctx.lineTo(40, cardY + radius);
    ctx.arcTo(40, cardY, 40 + radius, cardY, radius);
    ctx.closePath();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    // Red right portion (prix)
    const splitX = W - 280;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(splitX, cardY);
    ctx.lineTo(W - 40, cardY);
    ctx.lineTo(W - 40, cardY + cardH);
    ctx.lineTo(splitX, cardY + cardH);
    ctx.closePath();
    ctx.fillStyle = "#CC1418";
    ctx.fill();
    ctx.restore();

    // Saison label
    ctx.fillStyle = "#444444";
    ctx.font = "26px Arial";
    ctx.fillText(`☀ ${values.saison}`, 68, cardY + 46);

    // Dimension
    ctx.fillStyle = "#111111";
    ctx.font = "bold 52px 'Arial Black', Arial";
    const dimText = values.dimension;
    // Handle long dimensions with line break
    if (ctx.measureText(dimText).width > splitX - 90) {
      const parts = dimText.split(" ");
      const mid = Math.ceil(parts.length / 2);
      ctx.fillText(parts.slice(0, mid).join(" "), 68, cardY + 110);
      ctx.fillText(parts.slice(mid).join(" "), 68, cardY + 168);
    } else {
      ctx.fillText(dimText, 68, cardY + 130);
    }

    // Prix label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("À PARTIR DE", splitX + (W - 40 - splitX) / 2, cardY + 72);
    ctx.font = "bold 72px 'Arial Black', Arial";
    ctx.fillText(`${values.prix}€`, splitX + (W - 40 - splitX) / 2, cardY + 160);
    ctx.textAlign = "left";

    // ── MONTAGE INCLUS BANNER ──
    const bannerY = cardY + cardH;
    const bannerH = 58;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(40, bannerY);
    ctx.lineTo(W - 40, bannerY);
    ctx.lineTo(W - 40, bannerY + bannerH);
    ctx.arcTo(W - 40, bannerY + bannerH + radius, W - 40 - radius, bannerY + bannerH + radius, radius);
    ctx.lineTo(40 + radius, bannerY + bannerH);
    ctx.arcTo(40, bannerY + bannerH, 40, bannerY + bannerH - radius, radius);
    ctx.lineTo(40, bannerY);
    ctx.closePath();
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Arial Black', Arial";
    ctx.textAlign = "center";
    ctx.fillText("MONTAGE INCLUS ! 🔧", W / 2, bannerY + 38);
    ctx.textAlign = "left";
    ctx.restore();
  }, [bgImage, values]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const download = () => {
    setDownloading(true);
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zpneus-${values.dimension.replace(/\s/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, "image/png");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      color: "#fff",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      display: "flex",
      gap: 0,
    }}>
      {/* LEFT PANEL */}
      <div style={{
        width: 360,
        minWidth: 320,
        background: "#1a1a1a",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        borderRight: "1px solid #2a2a2a",
        overflowY: "auto",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#CC1418", boxShadow: "0 0 8px #CC1418"
            }} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Z-PNEUS</span>
            <span style={{ color: "#666", fontSize: 13 }}>Générateur de posts</span>
          </div>

          {/* Upload zone */}
          <label
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              display: "block",
              border: bgPreview ? "2px solid #CC1418" : "2px dashed #444",
              borderRadius: 12,
              padding: 0,
              cursor: "pointer",
              overflow: "hidden",
              transition: "border-color 0.2s",
              position: "relative",
              background: "#111",
              minHeight: bgPreview ? 160 : 120,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {bgPreview ? (
              <div style={{ position: "relative" }}>
                <img src={bgPreview} alt="fond" style={{
                  width: "100%", height: 160, objectFit: "cover", display: "block"
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <span style={{ color: "#fff", fontWeight: 600 }}>Changer l'image</span>
                </div>
              </div>
            ) : (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10, padding: "28px 20px"
              }}>
                <div style={{ fontSize: 36 }}>🖼</div>
                <span style={{ color: "#888", fontSize: 14, textAlign: "center" }}>
                  Glisse une photo ou clique pour choisir le fond
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Fields */}
        {[
          { key: "saison", label: "SAISON", placeholder: "ÉTÉ / HIVER / 4 SAISONS" },
          { key: "dimension", label: "DIMENSION", placeholder: "205/55 R16 91V" },
          { key: "prix", label: "PRIX (€)", placeholder: "49" },
          { key: "note", label: "NOTE /10", placeholder: "9" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              letterSpacing: 2, color: "#888", marginBottom: 8
            }}>{label}</label>
            <input
              type="text"
              value={values[key]}
              placeholder={placeholder}
              onChange={(e) => setValues(v => ({ ...v, [key]: e.target.value }))}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#111", border: "1px solid #333",
                borderRadius: 8, padding: "12px 14px",
                color: "#fff", fontSize: 16,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#CC1418"}
              onBlur={e => e.target.style.borderColor = "#333"}
            />
          </div>
        ))}

        <button
          onClick={download}
          disabled={downloading}
          style={{
            marginTop: 8,
            padding: "16px",
            background: downloading ? "#555" : "#CC1418",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 16,
            cursor: downloading ? "not-allowed" : "pointer",
            letterSpacing: 1,
            transition: "background 0.2s",
          }}
        >
          {downloading ? "Export..." : "⬇ Télécharger le post"}
        </button>

        <p style={{ color: "#555", fontSize: 12, textAlign: "center", marginTop: -8 }}>
          Format 1080×1350 px · PNG · Instagram
        </p>
      </div>

      {/* RIGHT PANEL — Preview */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "#0d0d0d",
      }}>
        <div style={{
          position: "relative",
          boxShadow: "0 20px 80px rgba(0,0,0,0.8)",
          borderRadius: 4,
          overflow: "hidden",
          maxHeight: "calc(100vh - 64px)",
          maxWidth: "calc((100vh - 64px) * 0.8)",
        }}>
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              maxHeight: "calc(100vh - 64px)",
            }}
          />
          {!bgImage && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}>
              <div style={{
                background: "rgba(204,20,24,0.15)",
                border: "1px dashed rgba(204,20,24,0.4)",
                borderRadius: 12, padding: "24px 32px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>
                  Ajoute une photo de fond pour prévisualiser
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
