from playwright.sync_api import sync_playwright
from pathlib import Path
import re, json
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
html=re.sub(r'<script src="js/bundle\\.js\\?v=[^"]+" defer></script>','',html)
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
css=(ROOT/'css/app.css').read_text(encoding='utf-8')
js=(ROOT/'js/bundle.js').read_text(encoding='utf-8')
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('console', lambda m: errors.append(('console',m.type,m.text)) if m.type=='error' else None)
    page.on('pageerror', lambda e: errors.append(('pageerror','error',str(e))))
    page.set_content(html, wait_until='domcontentloaded')
    page.add_style_tag(content=css)
    page.add_script_tag(content=js)
    page.wait_for_timeout(150)
    assert page.locator('.game-card').count()==4
    assert page.locator('#hubView').is_visible()
    # clean new game -> game view
    page.locator('#newGameBtn').click(); page.wait_for_timeout(80)
    assert page.locator('#gameView').is_visible()
    for _ in range(6): page.keyboard.press('Enter'); page.wait_for_timeout(25)
    # movement through actual keyboard event path
    x0=page.evaluate('state.engine.player.x')
    page.keyboard.down('ArrowRight'); page.wait_for_timeout(160); page.keyboard.up('ArrowRight'); page.wait_for_timeout(30)
    x1=page.evaluate('state.engine.player.x')
    assert x1>x0,(x0,x1)
    # keyboard guard: works and repeat cannot extend parry forever
    page.keyboard.down('KeyX'); page.wait_for_timeout(25)
    assert page.evaluate("state.engine.touch.has('guard')")
    page.evaluate('state.engine.parryTimer=.03')
    page.keyboard.press('KeyX'); page.wait_for_timeout(10)
    pval=page.evaluate('state.engine.parryTimer')
    assert pval<=.03,pval
    page.keyboard.up('KeyX'); page.wait_for_timeout(10)
    assert not page.evaluate("state.engine.touch.has('guard')")
    # pause / resume
    page.locator('#pauseBtn').click(); assert page.evaluate("state.engine.mode==='paused'")
    page.locator('#pauseBtn').click(); assert page.evaluate("state.engine.mode==='playing'")
    # map dialog
    page.locator('#mapBtn').click(); assert page.locator('#mapDialog').is_visible(); page.locator('#mapDialog button[aria-label="Cerrar"]').click()
    # advanced state to exercise weapon/rune controls
    page.evaluate("""()=>{state.save=normalizeSave({...defaultSave(),schema:6,runes:['VERDANT','EMBER','TIDE','ECHO','PRISM','AETHER'],equippedRune:'VERDANT',completed:['moss-gate','sunken-forge','tideglass','clockwood','obsidian-keep','starfall'],tools:['thorn-shears','ember-grapple','tide-mantle','echo-bell','prism-lens','sky-anchor'],weapons:['traveler-blade','briar-cleaver','ember-sabre','tide-pike','prism-edge','aether-blade'],equippedWeapon:'traveler-blade',currentMode:'world',currentWorld:'lantern-house',shards:150}); setSave(state.save); launchAdventure(false)}""")
    page.wait_for_timeout(120)
    for _ in range(3): page.keyboard.press('Enter'); page.wait_for_timeout(20)
    before=page.evaluate('state.save.equippedWeapon')
    page.locator('#weaponBtn').click(); page.wait_for_timeout(30)
    after=page.evaluate('state.save.equippedWeapon'); assert before!=after
    rb=page.evaluate('state.save.equippedRune')
    page.locator('#runeCycleBtn').click(); page.wait_for_timeout(30)
    ra=page.evaluate('state.save.equippedRune'); assert rb!=ra and ra=='EMBER',(rb,ra)
    page.keyboard.press('KeyT'); page.wait_for_timeout(25); assert page.evaluate("state.save.equippedRune==='TIDE'")
    page.keyboard.press('KeyT'); page.wait_for_timeout(25); assert page.evaluate("state.save.equippedRune==='ECHO'")
    page.evaluate("state.save.equippedRune='EMBER'; state.engine.hud()")
    page.locator('#runeBtn').click(); page.wait_for_timeout(30)
    assert page.evaluate('state.engine.runeCooldown')>0
    assert 'EMBER' in page.locator('#runeBtnLabel').inner_text()
    # campaign inventory can explicitly equip both weapon and rune
    page.locator('#leaveGameBtn').click(); page.wait_for_timeout(60)
    assert page.locator('#campaignView').is_visible()
    page.locator('[data-equip-rune="TIDE"]').click(); page.wait_for_timeout(20); assert page.evaluate("state.save.equippedRune==='TIDE'")
    page.locator('[data-equip-weapon="prism-edge"]').click(); page.wait_for_timeout(20); assert page.evaluate("state.save.equippedWeapon==='prism-edge'")
    # final ending callback reaches the dedicated credits view
    page.evaluate("""()=>{state.save.completed=['moss-gate','sunken-forge','tideglass','clockwood','obsidian-keep','starfall'];state.save.runes=['VERDANT','EMBER','TIDE','ECHO','PRISM','AETHER'];state.save.relics=['R1','R2','R3','R4','R5','R6'];state.save.quests=Object.fromEntries(QUESTS.map(q=>[q.id,'complete']));launchAdventure(false);state.engine.chapterIndex=6;state.engine.roomIndex=CAMPAIGN[6].rooms.length-1;state.engine.room=CAMPAIGN[6].rooms.at(-1);state.engine.finishChapter();while(state.engine&&state.engine.mode==='dialogue')state.engine.advanceMessage()}""")
    page.wait_for_timeout(60); assert page.locator('#endingView').is_visible(); assert 'Voluntary' in page.locator('#endingTitle').inner_text()
    page.locator('#postgameBtn').click(); page.wait_for_timeout(60)

    # mobile layout
    page.set_viewport_size({'width':390,'height':844}); page.wait_for_timeout(100)
    for _ in range(3): page.keyboard.press('Enter'); page.wait_for_timeout(15)
    assert page.locator('#runeCycleBtn').is_visible() and page.locator('#weaponBtn').is_visible() and page.locator('#runeBtn').is_visible()
    overflow=page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1')
    assert overflow
    page.screenshot(path=str(ROOT/'QA_V61_MOBILE.png'),full_page=True)
    # desktop screenshot too
    page.set_viewport_size({'width':1440,'height':1000}); page.wait_for_timeout(60)
    page.screenshot(path=str(ROOT/'QA_V61_DESKTOP.png'),full_page=True)
    assert not errors,errors
    browser.close()
print('BROWSER_E2E_INLINE_PASS')
