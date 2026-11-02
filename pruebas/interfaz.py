"""Pruebas de presentación con Chromium. Requiere Playwright de Python.
Ejecutar desde la raíz: python3 pruebas/interfaz.py
Usa un servidor y datos temporales; no modifica los datos de la demo.
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

raiz = Path(__file__).resolve().parents[1]
salidas = raiz / 'resultados'
salidas.mkdir(exist_ok=True)
carpeta = tempfile.mkdtemp(prefix='equilibrio-interfaz-')
proceso = subprocess.Popen(['node', 'servidor.mjs'], cwd=raiz, env={**os.environ, 'PORT': '0', 'HOST': '127.0.0.1', 'DIRECTORIO_DATOS': carpeta}, stdout=subprocess.PIPE, text=True)
try:
    puerto = proceso.stdout.readline().strip().split()[-1]
    base = f'http://127.0.0.1:{puerto}'
    with sync_playwright() as p:
        navegador = p.chromium.launch(executable_path=shutil.which('chromium'), headless=True, args=['--no-sandbox'])
        pagina = navegador.new_page(viewport={'width': 1440, 'height': 1000})
        errores = []
        pagina.on('pageerror', lambda error: errores.append(str(error)))
        pagina.goto(base, wait_until='networkidle')
        pagina.screenshot(path=str(salidas / 'inicio-escritorio.png'), full_page=True)
        assert pagina.locator('h1').inner_text() == 'Sentirte bien\nempieza por\nentenderte.'
        assert pagina.locator('.semana').count() == 3
        assert pagina.locator('.plan').count() == 2
        pagina.locator('[data-semana-publica="3"]').click()
        assert pagina.locator('.plan-estudio li').count() == 7
        pagina.locator('[data-accion="cerrar"]').click()
        pagina.locator('[data-comprar="esencial"]').click()
        pagina.locator('[name="nombre"]').fill('Visitante de prueba')
        pagina.locator('[name="correo"]').fill('ejemplo@example.com')
        pagina.locator('[name="acepta"]').check()
        pagina.get_by_role('button', name='Simular mi compra').click()
        pagina.wait_for_selector('.mensaje-exito')
        assert 'No se realizó ningún cobro' in pagina.locator('.mensaje-exito').inner_text()
        pagina.locator('[data-demo="esencial"]').click()
        pagina.wait_for_selector('.dias-grid')
        assert pagina.locator('[data-campus-vista="encuentros"]').count() == 0
        pagina.locator('[data-dia="1"]').click()
        pagina.wait_for_selector('.detalle-dia')
        assert pagina.locator('.material-fila').count() == 5
        pagina.locator('[data-completar="1"]').click()
        pagina.wait_for_function("() => document.querySelector('.completar').textContent.includes('Completado')")
        pagina.reload(wait_until='networkidle')
        assert 'Completado' in pagina.locator('.completar').inner_text()
        pagina.locator('[data-campus-semana="1"]').click()
        pagina.wait_for_selector('.dias-grid')
        assert pagina.locator('.dia-tarjeta.completo').count() == 1
        pagina.locator('[data-accion="cambiar-modalidad"]').click()
        pagina.locator('[data-demo="acompanado"]').click()
        pagina.wait_for_selector('[data-campus-vista="encuentros"]')
        pagina.screenshot(path=str(salidas / 'campus-escritorio.png'), full_page=True)
        pagina.locator('[data-campus-vista="encuentros"]').click()
        pagina.wait_for_selector('.sesion-tarjeta')
        assert pagina.locator('.sesion-tarjeta').count() == 3
        pagina.locator('[data-accion="administrar"]').click()
        pagina.locator('[data-demo="administrador"]').click()
        pagina.wait_for_selector('.tabs-admin')
        pagina.locator('[data-tab-admin="contenidos"]').first.click()
        pagina.wait_for_selector('#form-dia')
        pagina.locator('#form-dia [name="titulo"]').fill('Una bienvenida a tu ritmo')
        pagina.locator('#form-dia [name="clase"]').fill('https://drive.google.com/file/d/demostracion/view')
        pagina.locator('#form-dia button[type="submit"]').click()
        pagina.wait_for_function("() => document.querySelector('#notificacion').textContent.includes('Día 1 actualizado')")
        pagina.reload(wait_until='networkidle')
        pagina.locator('[data-tab-admin="contenidos"]').first.click()
        pagina.wait_for_selector('#form-dia')
        assert pagina.locator('#form-dia [name="titulo"]').input_value() == 'Una bienvenida a tu ritmo'
        pagina.locator('[data-tab-admin="compradores"]').click()
        pagina.wait_for_selector('[data-editar-acceso]')
        pagina.screenshot(path=str(salidas / 'administracion-escritorio.png'), full_page=True)
        pagina.locator('[data-editar-acceso]').last.click()
        pagina.locator('[name="acceso"]').select_option('pendiente')
        pagina.locator('#form-acceso button[type="submit"]').click()
        pagina.wait_for_function("() => !document.querySelector('#ventana').open")
        assert 'pendiente' in pagina.locator('.tabla').inner_text()
        pagina.locator('[data-tab-admin="compras"]').click()
        pagina.get_by_role('cell', name='Visitante de prueba', exact=True).wait_for()
        assert 'Visitante de prueba' in pagina.locator('.tabla').inner_text()
        pagina.goto(base, wait_until='networkidle')
        for ancho in [390, 768, 1440]:
            pagina.set_viewport_size({'width': ancho, 'height': 844})
            assert pagina.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Desborde en {ancho}'
        pagina.set_viewport_size({'width':390,'height':844})
        pagina.screenshot(path=str(salidas / 'inicio-movil.png'), full_page=True)
        pagina.get_by_role('button',name='Abrir menú').click()
        assert pagina.locator('.navegacion').is_visible()
        pagina.get_by_role('link', name='Tu recorrido', exact=True).click()
        assert not pagina.locator('.navegacion').is_visible()
        pagina.locator('[data-accion="administrar"]').click()
        pagina.locator('[data-demo="administrador"]').click()
        pagina.wait_for_selector('.tabs-admin')
        assert pagina.evaluate('document.documentElement.scrollWidth <= innerWidth')
        pagina.locator('[data-tab-admin="configuracion"]').click()
        pagina.wait_for_selector('#form-configuracion')
        pagina.screenshot(path=str(salidas / 'administracion-movil.png'), full_page=True)
        assert pagina.locator('dialog[open]').count() == 0
        assert not errores, errores
        navegador.close()
        print('OK: portada, compra simulada, Esencial, Acompañado, 21 días, progreso persistente, edición, accesos, compras, menú móvil y vistas 390/768/1440. Sin errores de JavaScript.')
finally:
    proceso.terminate()
    proceso.wait(timeout=10)
    shutil.rmtree(carpeta)
