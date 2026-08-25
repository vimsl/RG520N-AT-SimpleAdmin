import { useState, useEffect, useCallback } from 'react';
import { getAtCommands, parseAtResponse } from '../utils/atParser';
import { rsrpToPercent, sinrToPercent, rsrqToPercent, signalQuality } from '../utils/signal';

const DEFAULT = {
  sim: '-', temperature: '0', network_provider: '-', mccmnc: '-',
  apn: '-', network_mode: '-', ipv4: '-', ipv6: '-',
  bands: '-', bandwidth: '-', earfcns: '-', pcc_pci: '-',
  prxqrsrp: '0', drxqrsrp: '0', rx2qrsrp: '0', rx3qrsrp: '0',
  rsrpNR: '0', rsrqNR: '0', sinrNR: '0',
  rsrpLTE: '-', rsrqLTE: '-', sinrLTE: '-', rssi: '-',
  nr5g_dl_ambr: '0', nr5g_ul_ambr: '0', nr5g_qci: '-',
  netSpeedDown: '0.00', netSpeedUp: '0.00', csq: '-', cellID: '-',
  rsrpPct: 0, sinrPct: 0, rsrqPct: 0, signalPct: 0,
  quality: 'No Signal', online: false, lastUpdate: '-'
};

export default function useDeviceInfo(lang) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async (signal) => {
    try {
      const cmds = getAtCommands();
      const parts = await Promise.all(cmds.map(function(cmd){
        const params = new URLSearchParams({ atcmd: cmd });
        return fetch(`/cgi-bin/get_atcommand?${params}`, { signal: signal || AbortSignal.timeout(5000) }).then(function(r){return r.text()}).catch(function(){return ''});
      }));
      const text = parts.join('\n');
      
      if (!text?.trim()) throw new Error('Empty');
      const raw = parseAtResponse(text);
      const isLTE = raw.network_mode?.includes('LTE');
      const rsrp = parseFloat(isLTE ? raw.rsrpLTE : raw.rsrpNR) || -140;
      const sinr = parseFloat(isLTE ? raw.sinrLTE : raw.sinrNR) || -10;
      const rsrq = parseFloat(isLTE ? raw.rsrqLTE : raw.rsrqNR) || -20;
      const rsrpPct = rsrpToPercent(rsrp);
      const sinrPct = sinrToPercent(sinr);
      const rsrqPct = rsrqToPercent(rsrq);
      const sigPct = Math.round((rsrpPct + sinrPct) / 2);
      setData({
        ...DEFAULT, ...raw,
        rsrpPct, sinrPct, rsrqPct, signalPct: sigPct,
        quality: signalQuality(rsrpPct, sinrPct),
        online: raw.ipv4 && raw.ipv4.length > 5 && raw.ipv4 !== '-',
        lastUpdate: new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')
      });
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.warn('Fetch error:', e);
      const d = { ...DEFAULT };
      d.lastUpdate = new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US') + ' (Error)';
      setData(d);
    } finally { setLoading(false); }
  }, [lang]);

  useEffect(() => {
    const ac = new AbortController();
    fetch_(ac.signal);
    const iv = setInterval(() => fetch_(), 3000);
    return () => { ac.abort(); clearInterval(iv); };
  }, [fetch_]);

  return { data: data || DEFAULT, loading };
}