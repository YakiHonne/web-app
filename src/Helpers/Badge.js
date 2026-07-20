import React from 'react'
import { useTranslation } from "react-i18next";

export default function Badge({ data, size = 16 }) {
    const { t } = useTranslation();
    let { isProUser, plan, badge } = data
    if (!isProUser) return
    return (
        <div className='round-icon-tooltip fx-centered pointer' data-tooltip={plan === "basic" ? "Basic Yaki subscriber" : "Premium Yaki subscriber"}>
            <img src={badge} alt={t("AHMbUfO")} style={{ objectFit: 'contain', aspectRatio: '1:1', minWidth: `${size}px`, minHeight: `${size}px`, maxWidth: `${size}px`, maxHeight: `${size}px` }} />
        </div>
    )
}
