@echo off
chcp 65001 > nul
echo ==============================================================
echo  🤖 MSM-CONSEILS - SAUVEGARDE AUTOMATIQUE CHAQUE 10 MINUTES
echo ==============================================================

:loop
echo.
echo [%date% %time%] Verification des modifications pour la sauvegarde...

:: Force l'ajout de tous les fichiers (meme ceux recemment modifiés)
git add .

:: Tente un commit. S'il n'y a rien à modifier, la boucle continue
git commit -m "chore: auto-save local (agent backup)"

:: Pousse vers GitHub (Vercel prendra le relais si necessaire)
git push

echo.
echo ✅ Sauvegarde terminee. Prochain enregistrement dans 10 minutes...
echo (Ne fermez pas cette fenetre pour garder la sauvegarde active)

:: Attendre 600 secondes (10 minutes) sans interruption
timeout /t 600 /nobreak > nul

goto loop
