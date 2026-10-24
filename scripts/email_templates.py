#!/usr/bin/env python3
"""Supabase Auth email templates for Asso d'ici ("Carte d'adhérent" style).

    python scripts/email_templates.py          # write supabase/email-templates/*.html
    SUPABASE_ACCESS_TOKEN=... python scripts/email_templates.py --push
                                               # also upload subjects + templates to the project

The project's Auth config holds the live templates; this script is their source.
Links point to our own /auth/confirm with token_hash (Supabase's SSR pattern): unlike
{{ .ConfirmationURL }}, it works when the email is opened in another browser or device.
Every non-ASCII character is written as an HTML entity, so accents render whatever
charset a mail client assumes.
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

PROJECT_REF = "qeuliugmoegksrbntnti"
OUT_DIR = Path(__file__).resolve().parent.parent / "supabase" / "email-templates"
LOGO = "https://www.assodici.fr/brand/logo-on-dark.png"

# Tokens from src/app/globals.css (light theme).
SHELL, CARD, INK, MUTED, HAIRLINE, ON_SHELL = "#1f3fbf", "#fbfcfe", "#141821", "#4a5163", "#d5dae5", "#d3dbff"
FONT = "Arial,Helvetica,sans-serif"


def confirm_link(otp_type: str) -> str:
    # Our login always sends RedirectTo = <site>/auth/confirm?next=<path>; fall back to the site root otherwise.
    return (
        "{{ if .RedirectTo }}{{ .RedirectTo }}&{{ else }}{{ .SiteURL }}/auth/confirm?{{ end }}"
        f"token_hash={{{{ .TokenHash }}}}&type={otp_type}"
    )


def layout(title: str, body: str) -> str:
    html = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:{SHELL};">
<table role="presentation" style="width:100%;min-height:100vh;border-collapse:collapse;border-spacing:0;background-color:{SHELL};">
  <tr>
    <td style="padding:40px 16px;text-align:center;vertical-align:top;">
      <img src="{LOGO}" alt="Asso d'ici" style="display:block;width:180px;max-width:60%;height:auto;margin:0 auto 28px;border:0;">
      <table role="presentation" style="width:100%;max-width:480px;margin:0 auto;border-collapse:separate;border-spacing:0;background-color:{CARD};border-radius:18px;overflow:hidden;text-align:left;">
        <tr>
          <td style="height:10px;line-height:10px;font-size:0;background-color:{INK};">&#160;</td>
        </tr>
        <tr>
          <td style="padding:36px 32px 32px;font-family:{FONT};color:{INK};">
            <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:bold;color:{INK};">{title}</h1>
{body}
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-family:{FONT};font-size:13px;color:{ON_SHELL};">
        Asso d'ici &#183; <a href="https://www.assodici.fr" style="color:{ON_SHELL};">assodici.fr</a>
      </p>
    </td>
  </tr>
</table>
</body>
</html>
"""
    # French typography: no line break before "?" or ":".
    html = html.replace(" ?", "\u00a0?").replace(" :", "\u00a0:")
    return html.encode("ascii", "xmlcharrefreplace").decode("ascii")


def paragraph(text: str) -> str:
    return f'            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:{MUTED};">{text}</p>'


def button(label: str, href: str) -> str:
    return f"""            <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;">
              <tr>
                <td style="border-radius:999px;background-color:{SHELL};text-align:center;">
                  <a href="{href}" style="display:block;padding:16px 24px;font-family:{FONT};font-size:17px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px;">{label}</a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:{MUTED};">
              Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :<br>
              <a href="{href}" style="color:{SHELL};word-break:break-all;">{href}</a>
            </p>"""


def ignore_note(text: str = "Vous n'avez rien demandé ? Ignorez cet email, il ne se passera rien.") -> str:
    return (
        f'            <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid {HAIRLINE};'
        f'font-size:13px;line-height:1.6;color:{MUTED};">{text}</p>'
    )


def code_box() -> str:
    return (
        f'            <p style="margin:0 0 24px;padding:16px;border-radius:12px;background-color:#e3e8f6;'
        f'font-family:\'Courier New\',monospace;font-size:28px;letter-spacing:6px;text-align:center;color:{INK};">'
        "{{ .Token }}</p>"
    )


SECURITY_NOTE = "Si ce n'est pas vous, répondez à cet email ou écrivez-nous depuis le site pour sécuriser votre compte."

# key: (Supabase config name, subject, title, body)
TEMPLATES = {
    "magic-link": (
        "magic_link",
        "Votre lien de connexion à Asso d'ici",
        "Votre lien de connexion",
        "\n".join([
            paragraph("Cliquez sur le bouton pour vous connecter à Asso d'ici. Aucun mot de passe n'est nécessaire."),
            button("Se connecter", confirm_link("email")),
            ignore_note("Ce lien ne fonctionne qu'une fois et expire bientôt. Vous n'avez rien demandé ? Ignorez cet email, il ne se passera rien."),
        ]),
    ),
    "confirm-signup": (
        "confirmation",
        "Bienvenue sur Asso d'ici : confirmez votre adresse",
        "Bienvenue sur Asso d'ici",
        "\n".join([
            paragraph("Confirmez votre adresse email pour finaliser la création de votre compte. Vous pourrez ensuite revendiquer et modifier la page de votre association."),
            button("Confirmer et me connecter", confirm_link("email")),
            ignore_note(),
        ]),
    ),
    "reset-password": (
        "recovery",
        "Votre lien de connexion à Asso d'ici",
        "Connexion à votre compte",
        "\n".join([
            paragraph("Asso d'ici n'utilise pas de mot de passe : ce lien vous connecte directement à votre compte."),
            button("Se connecter", confirm_link("recovery")),
            ignore_note(),
        ]),
    ),
    "change-email": (
        "email_change",
        "Confirmez votre nouvelle adresse email",
        "Confirmez votre nouvelle adresse",
        "\n".join([
            paragraph("Vous avez demandé à remplacer l'adresse de votre compte {{ .Email }} par {{ .NewEmail }}. Confirmez ce changement :"),
            button("Confirmer la nouvelle adresse", confirm_link("email_change")),
            ignore_note("Vous n'êtes pas à l'origine de cette demande ? Ignorez cet email, votre adresse ne changera pas."),
        ]),
    ),
    "invite": (
        "invite",
        "Vous êtes invité sur Asso d'ici",
        "Vous êtes invité sur Asso d'ici",
        "\n".join([
            paragraph("Un compte Asso d'ici a été créé pour vous. Acceptez l'invitation pour vous connecter."),
            button("Accepter l'invitation", confirm_link("invite")),
            ignore_note(),
        ]),
    ),
    "reauthentication": (
        "reauthentication",
        "Votre code de vérification Asso d'ici",
        "Votre code de vérification",
        "\n".join([
            paragraph("Saisissez ce code pour confirmer qu'il s'agit bien de vous. Il expire bientôt."),
            code_box(),
            ignore_note(),
        ]),
    ),
    "email-changed": (
        "email_changed_notification",
        "L'adresse de votre compte a été modifiée",
        "Adresse email modifiée",
        "\n".join([
            paragraph("L'adresse de votre compte Asso d'ici est passée de {{ .OldEmail }} à {{ .Email }}."),
            ignore_note(SECURITY_NOTE),
        ]),
    ),
    "password-changed": (
        "password_changed_notification",
        "Le mot de passe de votre compte a été modifié",
        "Mot de passe modifié",
        "\n".join([
            paragraph("Le mot de passe de votre compte Asso d'ici vient d'être modifié."),
            ignore_note(SECURITY_NOTE),
        ]),
    ),
}

# Security notifications are off by default in Supabase; these two apply to an email-only project.
ENABLE_NOTIFICATIONS = ["email_changed", "password_changed"]


def build() -> dict:
    payload = {}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, (key, subject, title, body) in TEMPLATES.items():
        html = layout(title, body)
        (OUT_DIR / f"{filename}.html").write_text(html)
        payload[f"mailer_subjects_{key}"] = subject
        payload[f"mailer_templates_{key}_content"] = html
    for name in ENABLE_NOTIFICATIONS:
        payload[f"mailer_notifications_{name}_enabled"] = True
    return payload


def push(payload: dict) -> None:
    token = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if not token:
        sys.exit("SUPABASE_ACCESS_TOKEN is not set (create one at https://supabase.com/dashboard/account/tokens).")
    request = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth",
        data=json.dumps(payload).encode(),
        method="PATCH",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        print(f"Supabase Auth config updated ({response.status}): {len(TEMPLATES)} templates.")


if __name__ == "__main__":
    data = build()
    print(f"Wrote {len(TEMPLATES)} templates to {OUT_DIR}")
    # Self-check: nothing left that a mail client could mis-decode.
    assert all(v.isascii() for k, v in data.items() if k.endswith("_content"))
    if "--push" in sys.argv:
        push(data)
