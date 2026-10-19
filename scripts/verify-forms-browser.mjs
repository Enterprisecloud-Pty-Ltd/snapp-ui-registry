import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=path.join(root,'artifacts/figma-qa/forms');
await fs.mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1200},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`)});
const base=process.env.SNAPP_FIGMA_PREVIEW_URL??'http://127.0.0.1:4799';
const checks=[];
const check=(name,test)=>{assert.ok(test,name);checks.push(name)};
const select=id=>page.locator(`section[data-figma-node="${id}"]`);
async function style(locator){return locator.evaluate(element=>{const s=getComputedStyle(element),r=element.getBoundingClientRect();return {width:r.width,height:r.height,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,background:s.backgroundColor,border:s.borderColor,borderWidth:s.borderWidth,radius:s.borderRadius,padding:s.padding,gap:s.gap,boxShadow:s.boxShadow}})}
async function reset(){await page.goto(base+'/?group=forms');await page.evaluate(()=>document.fonts.ready);}
async function capture(name,locator){await locator.screenshot({path:path.join(artifacts,name+'.png'),animations:'disabled'});}
async function verifyQuickPanels(id,count){
  const panels=await page.getByRole('menu').evaluateAll(elements=>elements.map(element=>{const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}));
  check(`${id}:complete ${count}-panel composition`,panels.length===count);
  for(const [index,panel] of panels.entries())check(`${id}:panel ${index+1} source edge and vertical alignment`,Math.abs(panel.x-panels[0].x-index*208)<0.5&&Math.abs(panel.y-panels[0].y-(index===0?0:24))<0.5&&panel.width===208&&panel.height===(index===0?170:142));
  const x=Math.min(...panels.map(panel=>panel.x)),y=Math.min(...panels.map(panel=>panel.y)),right=Math.max(...panels.map(panel=>panel.x+panel.width)),bottom=Math.max(...panels.map(panel=>panel.y+panel.height));
  await page.screenshot({path:path.join(artifacts,`quick-complete-${id.replace(':','-')}.png`),clip:{x,y,width:right-x,height:bottom-y},animations:'disabled'});
  report.interactions.push({kind:'quick-actions-complete',nodeId:id,panels});
}
const report={capturedOn:'2026-10-19',browser:'Chromium',checks,errors,variants:[],interactions:[]};
try {
  await reset();
  const cdp=await page.context().newCDPSession(page); await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const {root:dom}=await cdp.send('DOM.getDocument',{depth:0});
  for(const state of ['hover','focus','pressed']) {
    const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:dom.nodeId,selector:`[data-preview-state="${state}"]`});
    for(const nodeId of nodeIds)await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:state==='hover'?['hover']:state==='focus'?['focus','focus-visible']:['active']});
  }
  for(const section of await page.locator('section[data-figma-node]').all()) {
    const id=await section.getAttribute('data-figma-node'),variant=await section.getAttribute('data-variant');
    if(id==='96:9877'){await section.getByRole('button',{name:'Select sample text',exact:true}).click();const selected=await section.locator('textarea').evaluate(input=>({value:input.value,start:input.selectionStart,end:input.selectionEnd,focused:document.activeElement===input,background:getComputedStyle(input,'::selection').backgroundColor,color:getComputedStyle(input,'::selection').color}));check('Comment edit actual text selection and source colours',selected.value==='Add a comment'&&selected.start===6&&selected.end===13&&selected.focused&&selected.background==='rgb(234, 246, 255)'&&selected.color==='rgb(127, 128, 130)');report.interactions.push({kind:'comment-real-selection',...selected});}
    const component=section.locator(':scope > :not(h3)').first();
    const measured=await style(component);
    report.variants.push({nodeId:id,variant,...measured});
    await capture(id.replace(':','-'),section);
  }
  for(const id of ['1:3049','243:2123','243:2125','243:2127','243:2129','1:3051','1:3053']) {
    const s=await style(select(id).getByRole('button'));
    check(`${id}:44px button/Aptos400/14px/20px/8px`,s.height===44&&s.font.startsWith('Aptos')&&s.weight==='400'&&s.size==='14px'&&s.lineHeight==='20px'&&s.radius==='8px');
  }
  check('Primary standard exact background',(await style(select('1:3049').getByRole('button'))).background==='rgb(47, 69, 92)');
  check('Primary hover exact background',(await style(select('243:2123').getByRole('button'))).background==='rgb(67, 87, 108)');
  check('Primary pressed exact background',(await style(select('243:2127').getByRole('button'))).background==='rgb(42, 44, 46)');
  check('Primary disabled native state',await select('243:2129').getByRole('button').isDisabled());
  const {nodeId:buttonNode}=await cdp.send('DOM.querySelector',{nodeId:dom.nodeId,selector:'[data-figma-node="1:3049"] button'});
  report.platformFonts=await cdp.send('CSS.getPlatformFontsForNode',{nodeId:buttonNode});
  check('Actual webfont face rendered',report.platformFonts.fonts.some(font=>font.familyName==='Aptos'&&font.isCustomFont&&font.glyphCount>0));
  const input=select('13:1295').getByPlaceholder('Field Content');
  check('Field input41px/8px',(await style(input)).height===41&&(await style(input)).radius==='8px');
  await input.fill('A real field value');check('Text input accepts edits',await input.inputValue()==='A real field value');
  check('Disabled field native state',await select('255:2210').getByPlaceholder('Field Content').isDisabled());
  for(const id of ['13:1399','311:2855','311:2863','13:1434','313:2933'])check(`${id}:notice44px`,(await style(select(id).locator('[data-slot="field-notice"]'))).height===44);
  check('Multiple notice142px',(await style(select('13:1383').locator('[data-slot="field-notice"]'))).height===142);
  for(const id of ['102:10660','248:2206','102:10810']){const inset=await select(id).getByRole('button').evaluate(button=>{const a=button.getBoundingClientRect(),icon=button.querySelector('img').getBoundingClientRect(),text=button.querySelector('span').getBoundingClientRect();return {iconX:icon.x-a.x,iconY:icon.y-a.y,iconWidth:icon.width,iconHeight:icon.height,textX:text.x-a.x,textY:text.y-a.y}});check(`${id}:source FilterButton icon12,10 and text36,8`,inset.iconX===12&&inset.iconY===10&&inset.iconWidth===16&&inset.iconHeight===16&&inset.textX===36&&inset.textY===8);}
  for(const id of ['13:1301','248:2179','35:2080','36:4528']){const surface=select(id).locator('[data-slot="form-control-surface"]');check(`${id}:zero gap and618px source text slot`,(await style(surface)).gap==='0px'&&(await style(surface.locator('input'))).width===618);}
  check('Button lookup zero gap and618px source text slot',(await style(select('13:1305').getByRole('combobox'))).gap==='0px'&&(await style(select('13:1305').getByRole('combobox').locator('span'))).width===618);
  const switchControl=select('13:1542').getByRole('switch');await switchControl.click();check('Switch toggles',await switchControl.getAttribute('aria-checked')==='true');await page.keyboard.press('Space');check('Switch keyboard toggles',await switchControl.getAttribute('aria-checked')==='false');
  const checkbox=select('158:2394').getByRole('checkbox');await checkbox.click();check('Checkbox toggles',await checkbox.getAttribute('aria-checked')==='true');await page.keyboard.press('Space');check('Checkbox keyboard toggles',await checkbox.getAttribute('aria-checked')==='false');
  check('Switch44x24',(await style(switchControl)).width===44&&(await style(switchControl)).height===24);
  check('Checkbox16x16',(await style(checkbox)).width===16&&(await style(checkbox)).height===16);
  check('Compound number field disables its lookup',await page.locator('[data-qa-number-disabled]').getByRole('combobox').isDisabled());
  check('Compound number field disables its numeric input',await page.getByRole('spinbutton',{name:'Disabled count',exact:true}).isDisabled());
  check('Colour field forwards disabled state',await page.getByLabel('Disabled colour',{exact:true}).isDisabled());
  const colorField=select('23:1804');
  await colorField.locator('input[type="color"]').focus();
  check('Colour field has visible keyboard focus',(await style(colorField.locator('[data-slot="form-control-surface"]'))).border==='rgb(47, 69, 92)');
  await colorField.locator('input[type="color"]').evaluate(input=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'#12ab34');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));});
  await colorField.locator('[data-selected-color="#12ab34"]').waitFor();
  check('Colour selection updates visible controlled value',(await colorField.innerText()).includes('#12ab34'));
  for(const id of ['19:1588','13:1463']) {
    await select(id).locator('input[type="file"]').setInputFiles({name:'registry-check.txt',mimeType:'text/plain',buffer:Buffer.from('safe local fixture')});
    check(`${id}:file selection surfaced`,(await select(id).innerText()).includes('registry-check.txt'));
  }
  await page.setViewportSize({width:1600,height:1600});
  for(const [id,size] of [['19:1601','lg'],['19:1648','md'],['19:1698','sm']]) {
    await select(id).getByRole('button').click();const dialog=page.getByRole('dialog');await dialog.waitFor();
    report.interactions.push({kind:'modal',modalSize:size,...await style(dialog)});await capture('modal-'+size,dialog);await capture('modal-'+size+'-footer',dialog.locator('[data-slot="dialog-footer"]'));check(`Modal ${size} exact full reference height`,(await style(dialog)).height===(size==='sm'?1248:1208));await page.keyboard.press('Escape');check(`Modal ${size} Escape closes`,await dialog.count()===0);
  }
  for(const id of ['49:4999','13:1413']) {
    await select(id).getByRole('button').click();const calendar=page.locator('[data-slot="popover-content"]');await calendar.waitFor();
    check(`${id}:complete250x293 source calendar`,(await style(calendar)).width===250&&(await style(calendar)).height===293);
    const layout=await calendar.evaluate(element=>{const a=element.getBoundingClientRect();const box=q=>{const r=q.getBoundingClientRect();return {x:r.x-a.x,y:r.y-a.y,width:r.width,height:r.height}};return {header:box(element.querySelector('.rdp-nav')),weekdays:box(element.querySelector('.rdp-weekdays')),weekdayCells:Array.from(element.querySelectorAll('.rdp-weekday')).map(box),days:Array.from(element.querySelectorAll('td.rdp-day')).map(box)}});
    check(`${id}:source12px header inset and226x32 header`,layout.header.x===12&&layout.header.y===12&&layout.header.width===226&&layout.header.height===32);
    check(`${id}:source weekday origin12,60`,layout.weekdays.x===12&&layout.weekdays.y===60&&layout.weekdays.height===21);
    check(`${id}:seven32px source weekday columns`,layout.weekdayCells.length===7&&layout.weekdayCells.every((day,index)=>day.x===12+index*32&&day.y===60&&day.width===32&&day.height===21));
    check(`${id}:35 fixed32px day cells and40px row pitch`,layout.days.length===35&&layout.days.every((day,index)=>day.x===12+(index%7)*32&&day.y===89+Math.floor(index/7)*40&&day.width===32&&day.height===32));report.interactions.push({kind:'calendar-nested-layout',nodeId:id,...layout});
    await capture('date-'+id.replace(':','-'),calendar);await page.keyboard.press('Escape');check(`${id}:calendar Escape closes`,await calendar.count()===0);
  }
  await select('49:5120').getByRole('combobox').click();const listbox=page.getByRole('listbox');await listbox.waitFor();await capture('select-open',listbox);await page.getByRole('option',{name:'Banana',exact:true}).click();check('Fixed Select selection',await select('49:5120').getByRole('combobox').innerText()==='Banana');
  const lookup=select('127:1943').getByRole('combobox');await lookup.click();await page.locator('[data-slot="lookup-search-input"]').fill('2');await page.getByRole('option',{name:'Selection 2'}).click();check('Searchable lookup selects filtered result',await lookup.innerText()==='Selection 2');
  for(const id of ['36:4344','36:4388','36:4428','36:4479','36:4512','38:4550']) {
    await select(id).getByRole('button').click();const menu=page.getByRole('menu').first();await menu.waitFor();report.interactions.push({kind:'quick-actions',nodeId:id,...await style(menu)});await capture('menu-'+id.replace(':','-'),menu);check(`${id}:menu208px`,(await style(menu)).width===208);
    if(id==='36:4388'||id==='36:4428'){await page.getByRole('menuitem',{name:'Descriptors',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.getByRole('menuitem',{name:'Titles',exact:true}).waitFor();}
    if(id==='36:4388')await verifyQuickPanels(id,2);
    if(id==='36:4428'){await page.getByRole('menuitem',{name:'Titles',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.getByRole('menuitem',{name:'H1',exact:true}).waitFor();check('Three-level quick action keyboard opens',true);await verifyQuickPanels(id,3);const leaf=await style(page.getByRole('menuitem',{name:'H1',exact:true}));check('Third-panel source4px leaf inset and28px row',leaf.padding==='4px'&&leaf.height===28);}
    await page.keyboard.press('Escape');await page.mouse.click(1550,20);
  }
  await select('102:10929').getByRole('button',{name:/Filter/}).click();let popup=page.locator('[data-slot="popover-content"]');await popup.waitFor();await popup.getByRole('button',{name:'Add filter',exact:true}).click();await popup.getByRole('button',{name:'Status',exact:true}).click();const option=popup.getByRole('button',{name:'Completed',exact:true});await option.click();check('Filter option adds selected token',(await popup.innerText()).includes('Completed'));await capture('filter-added',popup);await popup.getByRole('button',{name:'Clear All',exact:true}).click();check('Filter clear removes selections',await popup.getByRole('button',{name:'Clear All',exact:true}).count()===0);await page.keyboard.press('Escape');
  check('Every rendered image decodes',await page.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)));
  check('No page or asset errors',errors.length===0);
  report.status='passed';
} catch(error) { report.status='failed';report.failure=error.stack;process.exitCode=1; }
finally {await fs.writeFile(path.join(artifacts,'report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({status:report.status,variants:report.variants.length,checks:checks.length,failure:report.failure},null,2));
