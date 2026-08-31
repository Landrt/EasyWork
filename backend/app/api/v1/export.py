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

class ExportRequest(BaseModel):
    template: str
    cvData: Dict[str, Any]

@router.post("")
async def export_cv(request: ExportRequest):
    if not PLAYWRIGHT_AVAILABLE:
        raise HTTPException(status_code=500, detail="Playwright is not installed on the server.")

    # Convert cvData to JSON string
    cv_data_json = json.dumps(request.cvData)
    
    # In a real production env, this would be the deployed frontend URL.
    # For now, we assume frontend runs on localhost:3000
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    print_url = f"{frontend_url}/print?template={request.template}"

    try:
        async with async_playwright() as p:
            # Lancement de Chromium en mode headless
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Injection des données du CV dans la fenêtre globale avant le chargement de la page
            await page.add_init_script(f"window.cvData = {cv_data_json};")
            
            # Navigation vers la page d'impression spéciale du frontend
            # wait_until="networkidle" assure que les polices et composants sont chargés
            await page.goto(print_url, wait_until="networkidle")
            
            # Attendre explicitement que le texte soit rendu (au cas où)
            await page.wait_for_timeout(500)
            
            # Génération du PDF
            # print_background=True pour garder les couleurs de fond (très important pour les CV)
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            
            await browser.close()
            
            # Retourner le PDF directement avec le bon Content-Type
            return Response(content=pdf_bytes, media_type="application/pdf")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
