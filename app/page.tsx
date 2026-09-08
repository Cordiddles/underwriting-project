'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, Check, FileText, Landmark, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

type FormState = {
  borrower: string; propertyType: string; purchasePrice: string; currentValue: string;
  loanAmount: string; monthlyRent: string; term: string; experience: string;
  exit: string; occupancy: string; credit: string; works: string;
};

const initial: FormState = {
  borrower: 'Oak & Stone Property Ltd', propertyType: 'single', purchasePrice: '425000',
  currentValue: '450000', loanAmount: '292500', monthlyRent: '2600', term: '12',
  experience: '3plus', exit: 'refinance', occupancy: 'tenanted', credit: 'clean', works: 'light',
};
const scenarios: Record<'low' | 'moderate' | 'high', FormState> = {
  low: initial,
  moderate: { borrower: 'Cedar Homes SPV Ltd', propertyType: 'hmo', purchasePrice: '500000', currentValue: '525000', loanAmount: '378000', monthlyRent: '3200', term: '15', experience: 'one-two', exit: 'refinance', occupancy: 'vacant', credit: 'minor', works: 'light' },
  high: { borrower: 'Example High Risk SPV Ltd', propertyType: 'mixed', purchasePrice: '600000', currentValue: '625000', loanAmount: '500000', monthlyRent: '2100', term: '24', experience: 'none', exit: 'sale', occupancy: 'vacant', credit: 'significant', works: 'heavy' },
};

const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0);

export default function Home() {
  const [form, setForm] = useState<FormState>(initial);
  const [assessed, setAssessed] = useState(true);
  const result = useMemo(() => {
    const loan = Number(form.loanAmount || 0), value = Number(form.currentValue || 0);
    const price = Number(form.purchasePrice || 0), rent = Number(form.monthlyRent || 0);
    const ltv = value > 0 ? (loan / value) * 100 : 0;
    const ltp = price > 0 ? (loan / price) * 100 : 0;
    const yieldPct = value > 0 ? ((rent * 12) / value) * 100 : 0;
    let score = 18; const reasons: string[] = []; const conditions: string[] = [];
    if (ltv > 75) { score += 38; reasons.push('LTV exceeds 75%'); conditions.push('Reduce net loan or provide additional security'); }
    else if (ltv > 70) { score += 22; reasons.push('LTV is above 70%'); }
    else if (ltv > 65) { score += 10; reasons.push('LTV is within the 65–70% range'); }
    else reasons.push('Conservative leverage');
    if (form.credit === 'significant') { score += 28; reasons.push('Significant adverse credit disclosed'); conditions.push('Full credit explanation and evidence'); }
    if (form.credit === 'minor') { score += 10; reasons.push('Minor adverse credit disclosed'); }
    if (form.experience === 'none') { score += 14; reasons.push('First-time property investor'); conditions.push('Evidence of professional management'); }
    if (form.exit === 'sale') { score += 10; reasons.push('Exit relies on sale proceeds'); conditions.push('Independent valuation and saleability commentary'); }
    if (form.occupancy === 'vacant') { score += 11; reasons.push('Property is currently vacant'); conditions.push('Letting demand and rental appraisal'); }
    if (form.works === 'heavy') { score += 18; reasons.push('Heavy refurbishment proposed'); conditions.push('Costed schedule of works and monitoring'); }
    if (Number(form.term) > 18) { score += 8; reasons.push('Longer bridge term requested'); }
    if (yieldPct < 5 && form.exit === 'refinance') { score += 12; reasons.push('Rental yield may constrain refinance exit'); conditions.push('Refinance affordability evidence'); }
    score = Math.max(8, Math.min(96, score));
    const band = score >= 68 ? 'High' : score >= 42 ? 'Moderate' : 'Low';
    const decision = score >= 68 || ltv > 75 ? 'Refer / restructure' : score >= 42 ? 'Refer with conditions' : 'Proceed to full underwriting';
    const explanation = band === 'Low'
      ? `The case is classed as low risk because leverage is ${ltv.toFixed(1)}% LTV, the disclosed credit profile is ${form.credit}, and the borrower has ${form.experience === '3plus' ? 'three or more completed projects' : 'some relevant experience'}. The proposed ${form.exit === 'refinance' ? 'refinance exit' : 'exit'} is supported by a ${yieldPct.toFixed(1)}% gross rental yield. Full legal, valuation and affordability checks are still required.`
      : band === 'Moderate'
        ? `The case is classed as moderate risk because the ${ltv.toFixed(1)}% LTV leaves a narrower security margin and the assessment contains factors that require evidence or conditions. The ${yieldPct.toFixed(1)}% gross yield and proposed ${form.exit} exit should be tested against a realistic stressed refinance or sale scenario.`
        : `The case is classed as high risk because several material concerns combine: leverage is ${ltv.toFixed(1)}% LTV, the credit profile is ${form.credit}, the property is ${form.occupancy}, and the proposed exit is ${form.exit}. These factors increase both default risk and potential loss severity, so the case should be restructured or referred to senior credit authority.`;
    return { score, band, decision, ltv, ltp, yieldPct, reasons: reasons.slice(0, 4), conditions: conditions.slice(0, 3), explanation };
  }, [form]);
  const update = (key: keyof FormState, value: string) => { setForm((current) => ({ ...current, [key]: value })); setAssessed(false); };

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'stage_bridge_btl_assessment', title: 'Stage bridge BTL assessment',
      description: 'Populate the visible UK bridging buy-to-let assessment with borrower, property, loan and exit data.',
      inputSchema: {
        type: 'object',
        properties: {
          borrower: { type: 'string' }, propertyType: { type: 'string', enum: ['single', 'hmo', 'multi', 'mixed'] },
          purchasePrice: { type: 'number', minimum: 0 }, currentValue: { type: 'number', minimum: 0 },
          loanAmount: { type: 'number', minimum: 0 }, monthlyRent: { type: 'number', minimum: 0 },
          term: { type: 'number', minimum: 1 }, experience: { type: 'string', enum: ['none', 'one-two', '3plus'] },
          exit: { type: 'string', enum: ['refinance', 'sale', 'other'] }, occupancy: { type: 'string', enum: ['tenanted', 'vacant', 'purchase'] },
          credit: { type: 'string', enum: ['clean', 'minor', 'significant'] }, works: { type: 'string', enum: ['none', 'light', 'heavy'] },
        },
        required: ['borrower', 'propertyType', 'purchasePrice', 'currentValue', 'loanAmount', 'monthlyRent', 'term', 'experience', 'exit', 'occupancy', 'credit', 'works'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = input as Record<string, string | number>;
        const next = Object.fromEntries(Object.keys(initial).map((key) => [key, String(value[key])])) as FormState;
        setForm(next); setAssessed(false); return { status: 'staged', borrower: next.borrower };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-[#071b2c] text-white"><div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-[#35d1a0] text-[#062033]"><Landmark size={20} /></div><div><p className="text-[15px] font-semibold tracking-tight">Underwriting Project</p><p className="text-xs text-slate-400">Bridge-to-let decision workspace</p></div></div>
        <span className="rounded-full border border-[#35d1a0]/30 bg-[#35d1a0]/10 px-3 py-1 text-xs font-medium text-[#72e5bf]">UK · unregulated BTL prototype</span>
      </div></header>
      <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="space-y-5">
          <div><p className="text-sm font-medium text-primary">New case · Bridging buy-to-let</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Assess the bridge</h1><p className="mt-2 max-w-3xl text-base text-muted-foreground">Test leverage, property risk, borrower profile and exit viability. Verify all figures against the application, valuation and supporting evidence.</p></div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-3" aria-label="Example test cases"><span className="mr-1 text-sm font-medium text-muted-foreground">Test scenario:</span>{(['low','moderate','high'] as const).map((level) => <Button key={level} size="sm" variant="outline" onClick={() => { setForm(scenarios[level]); setAssessed(true); }} className="capitalize">{level} risk</Button>)}</div>
          <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
            <SectionTitle icon={<Building2 size={18} />} title="Property & facility" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Borrower / SPV" id="borrower"><Input id="borrower" value={form.borrower} onChange={(e) => update('borrower', e.target.value)} /></Field>
              <Field label="Property type" id="propertyType"><SelectField id="propertyType" value={form.propertyType} onChange={(v) => update('propertyType', v)} options={[['single','Single dwelling'],['hmo','HMO'],['multi','Multi-unit block'],['mixed','Mixed use']]} /></Field>
              <Field label="Purchase price (£)" id="purchasePrice"><NumberField id="purchasePrice" value={form.purchasePrice} onChange={(v) => update('purchasePrice', v)} /></Field>
              <Field label="Current value (£)" id="currentValue"><NumberField id="currentValue" value={form.currentValue} onChange={(v) => update('currentValue', v)} /></Field>
              <Field label="Net loan required (£)" id="loanAmount"><NumberField id="loanAmount" value={form.loanAmount} onChange={(v) => update('loanAmount', v)} /></Field>
              <Field label="Term (months)" id="term"><NumberField id="term" value={form.term} onChange={(v) => update('term', v)} /></Field>
              <Field label="Monthly market rent (£)" id="monthlyRent"><NumberField id="monthlyRent" value={form.monthlyRent} onChange={(v) => update('monthlyRent', v)} /></Field>
              <Field label="Current occupancy" id="occupancy"><SelectField id="occupancy" value={form.occupancy} onChange={(v) => update('occupancy', v)} options={[['tenanted','Tenanted'],['vacant','Vacant'],['purchase','Purchase pending']]} /></Field>
              <Field label="Works required" id="works"><SelectField id="works" value={form.works} onChange={(v) => update('works', v)} options={[['none','None'],['light','Light refurbishment'],['heavy','Heavy refurbishment']]} /></Field>
            </div>
            <div className="my-7 border-t" />
            <SectionTitle icon={<Landmark size={18} />} title="Borrower & exit" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Property experience" id="experience"><SelectField id="experience" value={form.experience} onChange={(v) => update('experience', v)} options={[['none','First-time investor'],['one-two','1–2 completed projects'],['3plus','3+ completed projects']]} /></Field>
              <Field label="Primary exit" id="exit"><SelectField id="exit" value={form.exit} onChange={(v) => update('exit', v)} options={[['refinance','Refinance to term BTL'],['sale','Open-market sale'],['other','Other / mixed']]} /></Field>
              <Field label="Credit profile" id="credit"><SelectField id="credit" value={form.credit} onChange={(v) => update('credit', v)} options={[['clean','Clean'],['minor','Minor adverse'],['significant','Significant adverse']]} /></Field>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3 border-t pt-5"><Button size="lg" className="h-11 bg-[#087e64] px-5 hover:bg-[#076b56]" onClick={() => setAssessed(true)}><Sparkles /> Assess case</Button><Button size="lg" variant="outline" className="h-11" onClick={() => { setForm(initial); setAssessed(true); }}>Reset example</Button>{!assessed && <span className="text-sm text-amber-700">Inputs changed — run assessment again</span>}</div>
          </div>
          <div className="rounded-2xl border border-dashed bg-white p-5"><div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100"><FileText size={19} /></div><div><h2 className="font-semibold">Evidence checklist</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">For production: application form, valuation, title, AST/rental appraisal, bank statements, credit search, schedule of works and evidence supporting the exit. Secure upload and AI extraction are not enabled in this prototype.</p></div></div></div>
        </section>
        <aside className="xl:sticky xl:top-6 xl:self-start"><div className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${!assessed ? 'opacity-55' : ''}`} aria-live="polite">
          <div className="bg-[#071b2c] p-6 text-white"><div className="flex items-center justify-between"><span className="text-sm text-slate-300">Illustrative case risk</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">Bridge rules v0.2</span></div><div className="mt-5 flex items-end gap-3"><strong className="text-6xl font-semibold tracking-tighter">{result.score}</strong><span className="mb-2 text-slate-400">/ 100</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#35d1a0] transition-all" style={{ width: `${result.score}%` }} /></div><div className="mt-4 flex items-center justify-between"><span className="text-sm text-slate-300">Risk band</span><span className="text-lg font-semibold text-[#6ce0ba]">{result.band}</span></div></div>
          <div className="grid grid-cols-3 border-b bg-slate-50"><Metric label="LTV" value={`${result.ltv.toFixed(1)}%`} /><Metric label="LTP" value={`${result.ltp.toFixed(1)}%`} /><Metric label="Gross yield" value={`${result.yieldPct.toFixed(1)}%`} /></div>
          <div className="p-6"><div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><AlertTriangle className="mt-0.5 shrink-0" size={18} /><div><p className="text-sm font-semibold">{result.decision}</p><p className="mt-1 text-sm leading-5 text-amber-800">Credit approval remains with an authorised underwriter.</p></div></div>
            <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4"><h2 className="text-sm font-semibold text-sky-950">Why this judgement was reached</h2><p className="mt-2 text-sm leading-6 text-sky-900">{result.explanation}</p></div>
            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key factors</h2><ul className="mt-3 space-y-3">{result.reasons.map((reason) => <li key={reason} className="flex gap-3 text-sm"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={13} /></span><span>{reason}</span></li>)}</ul>
            {result.conditions.length > 0 && <><h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Suggested conditions</h2><ul className="mt-3 space-y-2">{result.conditions.map((condition) => <li key={condition} className="text-sm">• {condition}</li>)}</ul></>}
            <div className="mt-6 border-t pt-5"><p className="text-sm font-medium">Illustrative only</p><p className="mt-1 text-sm leading-6 text-muted-foreground">This is not a credit offer, valuation, affordability assessment or regulated advice. Calibrate policies, pricing and exit tests to the lender’s approved credit appetite before use.</p><p className="mt-3 text-xs text-muted-foreground">Example request: {money(Number(form.loanAmount))} for {form.term} months.</p></div>
          </div>
        </div></aside>
      </div>
    </main>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>; }
function NumberField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) { return <Input id={id} type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} />; }
function SelectField({ id, value, onChange, options }: { id: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v,l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect>; }
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center gap-2 text-[#0d6957]">{icon}<h2 className="text-lg font-semibold text-foreground">{title}</h2></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="border-r px-3 py-4 text-center last:border-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
