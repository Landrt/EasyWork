import os
import re

SRC_DIR = '/home/landry/GenCV/src/app'

# Define replacements
LINK_REPLACEMENTS = [
    (r'href="#"(>Mentions Légales)', r'href="/legal"\1'),
    (r'href="#"(>RGPD)', r'href="/privacy"\1'),
    (r'href="#"(>Support)', r'href="/support"\1'),
    (r'href="#"(>Mon profil)', r'href="/settings"\1'),
    (r'href="#"(>Réglages)', r'href="/settings"\1'),
    (r'href="#"(>Affilié)', r'href="/affiliate"\1'),
    (r'href="#"(>Voir l&apos;offre originale)', r'href="/offers"\1'),
]

# For buttons, we find any <button ...> that doesn't have onClick or type="submit"
# and we add onClick={() => alert('WIP')}
BUTTON_RE = re.compile(r'<button\s+(?![^>]*\b(onClick|type="submit"|type=\'submit\')\b)[^>]*>')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    needs_client = False

    # Apply link replacements
    for pattern, repl in LINK_REPLACEMENTS:
        content = re.sub(pattern, repl, content)

    # Apply button replacements
    def replace_button(match):
        nonlocal needs_client
        needs_client = True
        btn_tag = match.group(0)
        # insert onClick just before the closing >
        return btn_tag[:-1] + ' onClick={() => alert("Fonctionnalité en cours de développement")}>'

    content = BUTTON_RE.sub(replace_button, content)

    # specific replacements
    content = content.replace('href="#"', 'href="/"') # fallback for any remaining href="#"

    # If we added onClick, we need "use client"
    if needs_client and '"use client"' not in content and "'use client'" not in content:
        content = '"use client";\n\n' + content

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
