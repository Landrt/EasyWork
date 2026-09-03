import json
import base64
import tempfile
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

router = APIRouter()

ALLOWED_TEMPLATES = {"devellopeur", "modern", "executive"}

class ExportRequest(BaseModel):
    template: str
    cvData: Dict[str, Any]

@router.post("")
async def export_cv(request: ExportRequest):
    if not PLAYWRIGHT_AVAILABLE:
        raise HTTPException(status_code=500, detail="Playwright is not installed on the server.")

    normalized_template = request.template.lower().strip()
    if normalized_template not in ALLOWED_TEMPLATES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid template. Allowed templates: {', '.join(sorted(ALLOWED_TEMPLATES))}"
        )

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    print_url = f"{frontend_url}/print?template={normalized_template}"
    
    # Safe JSON serialization for browser init script
    cv_data_json = json.dumps(request.cvData)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            )
            context = await browser.new_context(
                viewport={"width": 1200, "height": 1600}
            )
            page = await context.new_page()
            
            # Injection sécurisée des données
            await page.add_init_script(f"window.cvData = {cv_data_json};")
            
            # Navigation sans blocage HMR dev
            await page.goto(print_url, wait_until="domcontentloaded", timeout=10000)
            await page.wait_for_timeout(800)
            
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="cv_{normalized_template}.pdf"'}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
