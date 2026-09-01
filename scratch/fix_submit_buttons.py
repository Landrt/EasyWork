import os
import re

SRC_DIR = '/home/landry/GenCV/src/app'

# We want to find type="submit" ... onClick={() => alert("Fonctionnalité en cours de développement")}
# and remove the onClick.
# Since it could be in any order, we just find onClick={() => alert("Fonctionnalité en cours de développement")} 
# in the same tag as type="submit"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    def replace_submit(match):
        tag = match.group(0)
        if 'type="submit"' in tag or "type='submit'" in tag or 'type="button"' in tag:
            # remove the alert
            tag = tag.replace(' onClick={() => alert("Fonctionnalité en cours de développement")}', '')
        return tag
    
    # regex for <button ...>
    content = re.sub(r'<button[^>]*>', replace_submit, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
