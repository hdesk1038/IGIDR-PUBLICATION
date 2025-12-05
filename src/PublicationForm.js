import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwVgL-sWcBMHdFCehuCrwYCH9Exn99AZX2bgqPeTOsgo2m3F-wQUFPrrSn1lmo5RQ/exec";

const PublicationForm = () => {
    const [formData, setFormData] = useState({
        category: "PP",
        author: "",
        email: "",
        title: "",
        abstract: "",
        jelcode: "",
        keywords: "",
        acknow: "",
        file: null,
    });

    const [assignedNo, setAssignedNo] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        // === Character length limits ===
        if (name === "abstract" && value.length > 2500) {
            toast.error("❌ Abstract cannot exceed 2500 characters.");
            return;
        }
        if (name === "jelcode" && value.length > 80) {
            toast.error("❌ JEL Code cannot exceed 80 characters.");
            return;
        }
        if (name === "keywords" && value.length > 200) {
            toast.error("❌ Keywords cannot exceed 200 characters.");
            return;
        }
        if (name === "acknow" && value.length > 600) {
            toast.error("❌ Acknowledgement cannot exceed 600 characters.");
            return;
        }

        // === Update state ===
        if (type === "file") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };


    // safe conversion: Uint8Array -> base64 (chunked)
    function uint8ToBase64(u8) {
        const CHUNK = 0x8000;
        let index = 0;
        let res = "";
        while (index < u8.length) {
            const slice = u8.subarray(index, Math.min(index + CHUNK, u8.length));
            res += String.fromCharCode.apply(null, slice);
            index += CHUNK;
        }
        return btoa(res);
    }

    // Create cover + abstract PDF as a PDFDocument and return its bytes (Uint8Array)
    async function generateCoverAndAbstractBytes(publicationNo, meta) {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

        // ====== COVER PAGE CREATION ======
        const cover = pdfDoc.addPage([595, 842]);
        const { width, height } = cover.getSize();

        // Background
        cover.drawRectangle({
            x: 0,
            y: 0,
            width: width,
            height: height,
            color: rgb(0.851, 1, 1),
        });

        // Draw publication number (top-right)
        const pubFontSize = 14;
        const pubNumber = publicationNo;
        const pubWidth = fontBold.widthOfTextAtSize(pubNumber, pubFontSize);

        cover.drawText(pubNumber, {
            x: width - pubWidth - 50, // 50 px padding from right
            y: height - 50,           // 50 px from top
            size: pubFontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        // ====== HELPER FUNCTION ======
        function wrapTextByWidth(text, font, fontSize, maxWidth) {
            if (!text) return [];
            const words = text.split(/\s+/);
            let lines = [];
            let currentLine = "";

            for (let word of words) {
                const testLine = currentLine ? currentLine + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            return lines;
        }

        // ====== TITLE ======
        const titleSizeCover = 19;
        const titleLinesCover = wrapTextByWidth(meta.title || "", fontBold, titleSizeCover, width - 100);
        let y = height - 100;

        for (const line of titleLinesCover) {
            const textWidth = fontBold.widthOfTextAtSize(line, titleSizeCover);

            cover.drawText(line, {
                x: (width - textWidth) / 2, // center align
                y,
                size: titleSizeCover,
                font: fontBold,
                color: rgb(0.5, 0, 0), // maroon
            });

            y -= 25; // spacing between lines
        }

        y -= 80; // gap before authors

        // ====== AUTHORS ======
        const authorSizeCover = 13;
        const authorLinesCover = wrapTextByWidth(meta.author || "", font, authorSizeCover, width - 100);

        for (const line of authorLinesCover) {
            const lineWidth = font.widthOfTextAtSize(line, authorSizeCover);

            cover.drawText(line, {
                x: (width - lineWidth) / 2, // center align
                y,
                size: authorSizeCover,
                font,
                color: rgb(0, 0, 0),
            });

            y -= 18; // spacing between lines
        }

        // --- Insert IGIDR LOGO ---
        const path1 = `M17 1323 c-4 -318 -5 -654 -2 -748 2 -93 4 -259 5 -368 l0 -197 733  2 732 3 3 680 c2 374 0 798 -4 943 l-6 262 -728 0 -727 0 -6 -577z m1443 -367 l0 -913 -46 -7 c-61 -8 -1253 -8 -1321 0 l-53 7 0 913 0 914 710 0 710 0 0 -914z`;   // Outer frame

        const path2 = `M714 1720 c-59 -24 -72 -104 -25 -151 46 -45 111 -35 145 22 23 39 13 81 -26 114 -30 26 -57 30 -94 15z`; // Circle + dot

        const path3 = `M577 1515 c-174 -48 -307 -182 -361 -364 -21 -72 -21 -220 0 -292 27 -89 72 -168 134 -232 l59 -60 -101 -109 c-87 -94 -100 -112 -90 -126 7 -10 19 -31 29 -49 15 -30 15 -33 -5 -71 -11 -22 -18 -43 -15 -46 8 -8 1038 -8 1046 0 3 4 -4 19 -15 35 -30 40 -28 87 5 113 15 12 27 26 27 32 0 5 -47 56 -105 114 l-104 104 68 71 c108 114 151 221 151 381 0 233 -134 419 -357 493 -34 12 -78 21 -97 21 l-35 0 -3 -52 -3 -53 -57 -3 -58 -3 0 56 0 55 -32 -1 c-18 0 -55 -7 -81 -14z m101 -233 l3 -122 -68 0 c-81 0 -128 -20 -160 -69 -26 -39 -29 -77 -9 -126 16 -37 67 -75 102 -75 11 0 24 -3 27 -7 8 -7 -101 -126 -120 -131 -14 -4 -68 66 -94 123 -14 30 -19 64 -19 135 0 89 2 100 34 165 38 76 71 118 128 160 41 30 147 76 163 71 6 -1 11 -54 13 -124z m268 80 c68 -35 129 -97 170 -174 35 -67 38 -81 42 -168 3 -79 0 -104 -18 -152 -42 -112 -108 -146 -172 -89 -30 27 -33 34 -36 102 -5 91 15 125 79 135 l40 7 -3 66 -3 66 -112 3 -113 3 0 118 c0 65 3 120 6 124 7 7 66 -13 120 -41z m-138 -547 c1 -181 6 -333 10 -337 10 -10 114 18 185 49 l58 26 95 -94 c52 -51 94 -97 94 -101 0 -5 -225 -8 -500 -8 -394 0 -500 3 -500 13 1 6 41 54 90 106 l89 93 34 -21 c42 -26 127 -56 185 -66 l42 -7 0 335 0 336 33 4 c17 2 43 3 57 2 l25 -2 3 -328z m-250 -502 c-21 -2 -55 -2 -75 0 -21 2 -4 4 37 4 41 0 58 -2 38 -4z m230 0 c-32 -2 -84 -2 -115 0 -32 2 -6 3 57 3 63 0 89 -1 58 -3z m422 -23 c0 -7 -164 -10 -471 -10 -311 0 -468 3 -464 10 4 6 172 10 471 10 303 0 464 -3 464 -10z m-227 -37 c-127 -2 -339 -2 -470 0 -131 1 -27 2 232 2 259 0 366 -1 238 -2z m232 -33 c4 -7 -148 -10 -464 -10 -295 0 -471 4 -471 10 0 13 926 14 935 0z m-217 -37 c-137 -2 -359 -2 -496 0 -136 1 -24 2 248 2 272 0 384 -1 248 -2z`;  // Inner details + book shape

        const drawOptions = {
            x: width / 2 + 30,
            y: 240,
            scale: -0.05,
            color: rgb(0, 0, 0),
        };

        cover.drawSvgPath(path1, drawOptions);
        cover.drawSvgPath(path2, drawOptions);
        cover.drawSvgPath(path3, drawOptions);

        // Institute block
        const instLine1 = "INDIRA GANDHI INSTITUTE OF DEVELOPMENT RESEARCH";
        const instLine2 = "Film City Rd";
        const instLine3 = "Mumbai 400065";
        const instLine4 = "India";

        // Y starting position
        let instY = 200;

        // Line 1 (Bold & Bigger)
        const line1Width = fontBold.widthOfTextAtSize(instLine1, 14);
        cover.drawText(instLine1, {
            x: (width - line1Width) / 2,
            y: instY,
            size: 14,
            font: fontBold,
        });
        instY -= 20;

        // Line 2
        const line2Width = font.widthOfTextAtSize(instLine2, 13);
        cover.drawText(instLine2, {
            x: (width - line2Width) / 2,
            y: instY,
            size: 13,
            font,
        });
        instY -= 20;

        // Line 3
        const line3Width = font.widthOfTextAtSize(instLine3, 13);
        cover.drawText(instLine3, {
            x: (width - line3Width) / 2,
            y: instY,
            size: 13,
            font,
        });
        instY -= 20;

        // Line 4
        const line4Width = font.widthOfTextAtSize(instLine4, 13);
        cover.drawText(instLine4, {
            x: (width - line4Width) / 2,
            y: instY,
            size: 13,
            font,
        });

        // Date
        const dateStr = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
        const dateWidth = fontItalic.widthOfTextAtSize(dateStr, 12);
        const dateY = instY - 30; // 30 px spacing from last line of institute address

        cover.drawText(dateStr, {
            x: (width - dateWidth) / 2,
            y: dateY,
            size: 12,
            font: fontItalic,
        });

        // Abstract Page
        let absPage = pdfDoc.addPage([595, 842]);
        let ay = 780;
        const { widthAbs, heightAbs } = absPage.getSize();

        // Background color for abstract page
        // absPage.drawRectangle({
        //     x: 0,
        //     y: 0,
        //     width: widthAbs,
        //     height: heightAbs,
        //     color: rgb(0.851, 1, 1),
        // });

        const marginLeft = 50;
        const marginRight = 590;
        const lineWidthMax = marginRight - marginLeft;

        // ===== TITLE =====
        const titleSize = 18;
        const titleLines = wrapTextByWidth(meta.title || "", fontBold, titleSize, lineWidthMax);

        for (const line of titleLines) {
            const textWidth = fontBold.widthOfTextAtSize(line, titleSize);
            absPage.drawText(line, {
                x: (595 - textWidth) / 2,
                y: ay,
                size: titleSize,
                font: fontBold,
            });
            ay -= 26;
        }
        ay -= 20;

        // ===== AUTHOR =====
        const authorSize = 12;
        const authorLines = wrapTextByWidth(meta.author || "", font, authorSize, lineWidthMax);

        for (const line of authorLines) {
            const lineWidth = font.widthOfTextAtSize(line, authorSize);
            absPage.drawText(line, {
                x: (595 - lineWidth) / 2,
                y: ay,
                size: authorSize,
                font,
            });
            ay -= 20;
        }
        ay -= 10;

        // ===== EMAIL =====
        if (meta.email) {
            const emailText = `Email (corresponding author): ${meta.email}`;
            const emailSize = 11;
            const emailLines = wrapTextByWidth(emailText, font, emailSize, lineWidthMax);

            for (const line of emailLines) {
                const lineWidth = font.widthOfTextAtSize(line, emailSize);
                absPage.drawText(line, {
                    x: (595 - lineWidth) / 2,
                    y: ay,
                    size: emailSize,
                    font,
                    color: rgb(0, 0, 1),
                });
                ay -= 16;
            }
            ay -= 40;
        }

        // ===== Helper: wrap text within width =====
        function wrapTextByWidth(text, font, fontSize, maxWidth) {
            if (!text) return [];
            const words = text.split(/\s+/);
            let lines = [];
            let currentLine = "";

            for (let word of words) {
                const testLine = currentLine ? currentLine + " " + word : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        }

        // ===== ABSTRACT =====
        const absHeading = "ABSTRACT";
        const absHeadingWidth = fontBold.widthOfTextAtSize(absHeading, 14);
        absPage.drawText(absHeading, {
            x: (595 - absHeadingWidth) / 2,
            y: ay,
            size: 14,
            font:fontBold,
        });
        ay -= 45;

        // Abstract body (justified)
        const absLines = wrapText(meta.abstract || "", 95);
        const bodySize = 11;

        for (let i = 0; i < absLines.length; i++) {
            let line = absLines[i];
            const words = line.split(" ");
            let textWidth = font.widthOfTextAtSize(line, bodySize);

            if (words.length > 1 && i !== absLines.length - 1) {
                const extraSpace = (lineWidthMax - textWidth) / (words.length - 1);
                let x = marginLeft;
                for (const word of words) {
                    absPage.drawText(word, { x, y: ay, size: bodySize, font: fontItalic });
                    x += font.widthOfTextAtSize(word, bodySize) + extraSpace;
                }
            } else {
                absPage.drawText(line, { x: marginLeft, y: ay, size: bodySize, font });
            }

            ay -= bodySize + 6;
            if (ay < 80) {
                const newPage = pdfDoc.addPage([595, 842]);
                ay = 780;
            }
        }
        ay -= 35;

        // ===== KEYWORDS =====
        if (meta.keywords) {
            const kwLabel = "Keywords:";
            const kwLabelSize = 11;
            const kwText = meta.keywords;
            const kwSize = 11;

            // Pre-calc height needed
            const kwLines = wrapText(kwText, 95);
            const kwHeight = kwLabelSize + 10 + (kwLines.length * (kwSize + 6));

            // If not enough space, move to new page
            if (ay - kwHeight < 80) {
                absPage = pdfDoc.addPage([595, 842]);
                ay = 780;
            }

            // Draw label
            absPage.drawText(kwLabel, {
                x: marginLeft,
                y: ay,
                size: kwLabelSize,
                font: fontBold,
            });

            let kwY = ay - (kwLabelSize + 4);
            for (let i = 0; i < kwLines.length; i++) {
                const line = kwLines[i];
                const words = line.split(" ");
                const textWidth = font.widthOfTextAtSize(line, kwSize);

                if (words.length > 1 && i !== kwLines.length - 1) {
                    const extraSpace = (lineWidthMax - textWidth) / (words.length - 1);
                    let x = marginLeft;
                    for (const word of words) {
                        absPage.drawText(word, { x, y: kwY, size: kwSize, font });
                        x += font.widthOfTextAtSize(word, kwSize) + extraSpace;
                    }
                } else {
                    absPage.drawText(line, { x: marginLeft, y: kwY, size: kwSize, font });
                }
                kwY -= kwSize + 5;
            }

            ay = kwY - 15;
        }

        // ===== JEL Code =====
        if (meta.jelcode) {
            const jelHeight = 55;
            if (ay - jelHeight < 80) {
                absPage = pdfDoc.addPage([595, 842]);
                ay = 780;
            }

            absPage.drawText("JEL Code: ", {
                x: marginLeft,
                y: ay,
                size: 11,
                font: fontBold,
            });
            absPage.drawText(meta.jelcode, {
                x: marginLeft + 70,
                y: ay,
                size: 11,
                font,
            });
            ay -= (jelHeight-10);
        }

        // ===== ACKNOWLEDGMENT =====
        if (meta.acknowledgment) {
            const ackLabel = "Acknowledgment:";
            const ackLines = wrapText(meta.acknowledgment, 95);
            const ackHeight = bodySize + 10 + (ackLines.length * (bodySize + 6));

            // If not enough space, move whole section to next page
            if (ay - ackHeight < 80) {
                absPage = pdfDoc.addPage([595, 842]);
                ay = 780;
            }

            // Draw label
            absPage.drawText(ackLabel, {
                x: marginLeft,
                y: ay,
                size: bodySize,
                font: fontBold,
            });

            let ackY = ay - (bodySize + 4);
            for (let i = 0; i < ackLines.length; i++) {
                const line = ackLines[i];
                const words = line.split(" ");
                const textWidth = font.widthOfTextAtSize(line, bodySize);

                if (words.length > 1 && i !== ackLines.length - 1) {
                    const extraSpace = (lineWidthMax - textWidth) / (words.length - 1);
                    let x = marginLeft;
                    for (const word of words) {
                        absPage.drawText(word, { x, y: ackY, size: bodySize, font: fontItalic });
                        x += fontItalic.widthOfTextAtSize(word, bodySize) + extraSpace;
                    }
                } else {
                    absPage.drawText(line, { x: marginLeft, y: ackY, size: bodySize, font: fontItalic });
                }
                ackY -= bodySize + 5;
            }

            ay = ackY - 10;
        }

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }


    // === Helper: simple text wrapping ===
    function wrapText(text, maxChars) {
        const words = text.split(" ");
        const lines = [];
        let line = "";
        for (const word of words) {
            if ((line + word).length > maxChars) {
                lines.push(line.trim());
                line = "";
            }
            line += word + " ";
        }
        if (line.trim()) lines.push(line.trim());
        return lines;
    }


    // helper: naive wrap text to approx words per line
    function wrapText(text, approxChars) {
        if (!text) return [""];
        const words = text.split(/\s+/);
        const lines = [];
        let cur = "";
        for (const w of words) {
            if ((cur + " " + w).trim().length <= approxChars) {
                cur = (cur + " " + w).trim();
            } else {
                lines.push(cur);
                cur = w;
            }
        }
        if (cur) lines.push(cur);
        return lines;
    }

    // Merge cover+abstract bytes + user's uploaded PDF (File) in browser; return Uint8Array of merged PDF
    async function mergeCoverAndUserPdf(publicationNo) {
        // 1. Generate cover+abstract bytes
        const meta = {
            title: formData.title,
            author: formData.author,
            abstract: formData.abstract,
            email: formData.email,
            keywords: formData.keywords,
            category: formData.category,
            jelcode: formData.jelcode,
            acknowledgment: formData.acknow  
        };

        const coverBytes = await generateCoverAndAbstractBytes(publicationNo, meta);

        // 2. Load cover and uploaded doc into pdf-lib
        const coverDoc = await PDFDocument.load(coverBytes);
        const uploadedArrayBuffer = await formData.file.arrayBuffer();
        const uploadedDoc = await PDFDocument.load(uploadedArrayBuffer);

        // 3. Create merged doc and copy pages
        const merged = await PDFDocument.create();

        const coverPages = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
        coverPages.forEach(p => merged.addPage(p));

        const userPages = await merged.copyPages(uploadedDoc, uploadedDoc.getPageIndices());
        userPages.forEach(p => merged.addPage(p));

        // 4. Save merged bytes
        const mergedBytes = await merged.save();
        return mergedBytes; // Uint8Array
    }

    // Reserve a publication number from Apps Script
    async function reservePublicationNumber(category) {
        const url = `${WEB_APP_URL}?action=reserve&category=${encodeURIComponent(category)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Reserve request failed: " + res.status);
        const json = await res.json();
        if (!json.success) throw new Error("Reserve error: " + (json.error || "unknown"));
        return json.number;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.file) {
            alert("Please select a PDF file.");
            return;
        }
        if (formData.file.type !== "application/pdf") {
            alert("Only PDF files are allowed.");
            return;
        }
        if (formData.file.size > 10 * 1024 * 1024) {
            alert("File exceeds 10MB limit.");
            return;
        }

        setSubmitting(true);
        setAssignedNo(null);

        try {
            // 1) Reserve number from server (so sheet gets RESERVED row)
            const publicationNo = await reservePublicationNumber(formData.category);
            setAssignedNo(publicationNo);

            // 2) Merge cover+abstract with user pdf locally (browser)
            const mergedBytes = await mergeCoverAndUserPdf(publicationNo);

            // 3) Convert merged bytes -> base64 (safe)
            const mergedBase64 = uint8ToBase64(new Uint8Array(mergedBytes));

            // 4) Build form-encoded body (Apps Script expects e.parameter)
            const body = new URLSearchParams();
            body.append("publicationNo", publicationNo);
            body.append("category", formData.category);
            body.append("author", formData.author);
            body.append("email", formData.email);
            body.append("title", formData.title);
            body.append("abstract", formData.abstract);
            body.append("jelcode", formData.jelcode);
            body.append("keywords", formData.keywords);
            body.append("acknow", formData.acknow);
            body.append("fileContent", mergedBase64);
            body.append("fileType", "application/pdf");
            body.append("fileName", publicationNo + ".pdf");

            // 5) POST to Apps Script
            const res = await fetch(WEB_APP_URL, {
                method: "POST",
                body: body,
            });

            const result = await res.json();
            if (result.success) {
                toast.success(
                    ({ closeToast }) => (
                        <div>
                            Submitted Successfully! <br />
                            Number: <strong>{publicationNo}</strong> <br />
                            <a
                                href={result.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
                            >
                                📂 View Submitted File
                            </a>

                            <div className="mt-3 flex gap-2">
                                {/* ✅ Save */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(WEB_APP_URL, {
                                                method: "POST",
                                                body: new URLSearchParams({
                                                    action: "save",
                                                    publicationNo,
                                                    category: formData.category,
                                                }),
                                            });
                                            const saveResult = await res.json();
                                            if (saveResult.success) {
                                                toast.success("👍 Record Finalized!");
                                            } else {
                                                toast.error("❌ Save failed: " + saveResult.error);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("⚠️ Error finalizing record");
                                        }
                                        closeToast();
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded"
                                >
                                    Save Record
                                </button>

                                {/* ❌ Delete */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(WEB_APP_URL, {
                                                method: "POST",
                                                body: new URLSearchParams({
                                                    action: "delete",
                                                    publicationNo,
                                                    category: formData.category,
                                                }),
                                            });
                                            const delResult = await res.json();
                                            if (delResult.success) {
                                                toast.success("🗑️ Record Deleted!");
                                            } else {
                                                toast.error("❌ Delete failed: " + delResult.error);
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("⚠️ Error deleting record");
                                        }
                                        closeToast();
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded"
                                >
                                    Delete Record
                                </button>
                            </div>
                        </div>
                    ),
                    {
                        autoClose: false,
                        closeOnClick: false,
                        draggable: false,
                    }
                );
            }


            else {
                alert("❌ Error: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Network / merge error: " + (err.message || err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-5 px-6 sm:px-8">
                        <h2 className="text-center text-xl sm:text-2xl font-bold text-white">
                            Upload IGIDR Publication
                        </h2>

                        <div className="mt-4 flex justify-center">
                            <Link
                                to="/description"
                                className="inline-block px-6 py-2 text-sm sm:text-base font-semibold text-indigo-600 bg-white rounded-lg shadow-md hover:bg-gray-100 transition animate-bounce"
                            >
                                📘 Guide to Filling the Publication Form
                            </Link>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                >
                                    <option value="BR">Book Review</option>
                                    <option value="WP">WP Series</option>
                                    <option value="MN">MN Series</option>
                                    <option value="PP">PP Series</option>
                                </select>
                            </div>

                            {/* Author */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Enter author name..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Email ( Corresponding Author )
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                    required
                                />
                            </div>

                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter publication title..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                    required
                                />
                            </div>

                            {/* Abstract */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Abstract
                                </label>
                                <textarea
                                    name="abstract"
                                    value={formData.abstract}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Enter abstract..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                    required
                                />
                            </div>

                            {/* JEL Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    JEL Code
                                </label>
                                <input
                                    type="text"
                                    name="jelcode"
                                    value={formData.jelcode}
                                    onChange={handleChange}
                                    placeholder="e.g., A1, B2"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                />
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="Enter keywords separated by commas..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                />
                            </div>

                            {/* Acknowledgement */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Acknowledgement
                                </label>
                                <textarea
                                    name="acknow"
                                    value={formData.acknow}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Enter acknowledgement text..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                                />
                            </div>

                            {/* File Upload */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Choose a file to upload
                                </label>
                                <div className="mt-1">
                                    {/* Wrap whole drop zone in label so it's clickable */}
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                                    >
                                        <svg
                                            className="mx-auto h-12 w-12 text-indigo-500"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <p className="mt-2 text-sm font-medium text-indigo-700">
                                            Click to Upload
                                        </p>
                                        <p className="text-xs text-gray-500">PDF only, max 10MB</p>

                                        {/* Hidden input field */}
                                        <input
                                            id="file-upload"
                                            name="file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                    </label>

                                    {/* Show selected file below the box */}
                                    {formData.file && (
                                        <div className="mt-3 text-sm text-indigo-700 bg-indigo-50 p-2 rounded-md border border-indigo-200 overflow-hidden text-ellipsis">
                                            📄 Selected file: {formData.file.name}
                                        </div>
                                    )}
                                </div>


                                <p className="text-sm text-gray-600 mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <span className="font-medium text-indigo-800">File requirements:</span> A4 size PDF, page numbers start at 1 (centered). File name should not contain spaces or special characters.
                                </p>
                            </div>

                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-center">
                            <button
                                type="submit"
                                disabled={submitting || !formData.file}
                                className={`w-full sm:w-auto text-white font-semibold py-3 px-8 rounded-lg shadow-md transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                 ${submitting || !formData.file ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 hover:shadow-lg hover:-translate-y-0.5'}`}
                            >
                                {submitting ? <div className="loading">
                                    <strong>Please, Wait for a while</strong><span className="dots"></span>
                                </div> : (
                                    <span className="flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        SUBMIT PUBLICATION
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Assigned number */}
                        {assignedNo && (
                            <div className="m-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                                ✅ Assigned Category Number: <strong>{assignedNo}</strong>
                                <br />
                                <b>Wait for the Submission..................</b>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={8000}/>
        </div>
    );
};

export default PublicationForm;

