const AT_CMD = 'AT+QSIMSTAT?;+CSQ;+QTEMP;+QUIMSLOT?;+QSPN;+CGCONTRDP=1;+QMAP="WWANIP";+QENG="servingcell";+QNWINFO;+QRSRP;+QNWCFG="nr5g_ambr";+QNWCFG="up/down"';

function decodeHex(hex) {
  if (!hex) return '-';
  let result = '';
  for (let i = 0; i < hex.length; i += 4) {
    const code = parseInt(hex.substr(i, 4), 16);
    if (!isNaN(code)) result += String.fromCharCode(code);
  }
  return result;
}

export function getAtCommand() { return AT_CMD; }

export function parseAtResponse(text) {
  const info = {
    sim: '-', temperature: '0', network_provider: '-', mccmnc: '-',
    apn: '-', network_mode: '-', ipv4: '-', ipv6: '-',
    bands: '-', bandwidth: '-', earfcns: '-', pcc_pci: '-',
    prxqrsrp: '0', drxqrsrp: '0', rx2qrsrp: '0', rx3qrsrp: '0',
    rsrpNR: '0', rsrqNR: '0', sinrNR: '0',
    rsrpLTE: '-', rsrqLTE: '-', sinrLTE: '-', rssi: '-',
    nr5g_dl_ambr: '0', nr5g_ul_ambr: '0', nr5g_qci: '-',
    netSpeedDown: '0.00', netSpeedUp: '0.00', csq: '0', cellID: '-'
  };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (text.includes('502Q-EA')) info.deviceModel = '502Q-EA';
  // Temperature
  const temps = lines.filter(l => l.startsWith('+QTEMP:'));
  let tSum = 0, tCount = 0;
  temps.forEach(l => {
    const parts = l.split(',');
    if (parts.length >= 2) {
      const v = parseInt(parts[1].replace(/"/g, '').trim());
      if (!isNaN(v) && v !== -273 && v !== 0) { tSum += v; tCount++; }
    }
  });
  info.temperature = tCount > 0 ? Math.round(tSum / tCount).toString() : '0';
  // SPN
  const spn = lines.find(l => l.startsWith('+QSPN:'));
  if (spn) {
    const p = spn.split(',');
    if (p.length >= 4) {
      const idx = parseInt(p[3].replace(/"/g, '').trim()) || 0;
      info.network_provider = idx === 0 ? p[1].replace(/"/g, '').trim() : decodeHex(p[1].replace(/"/g, '').trim());
      if (p.length >= 5) info.mccmnc = p[4].replace(/"/g, '').trim();
    }
  }
  // IP
  lines.forEach(l => {
    if (l.startsWith('+QMAP:')) {
      const p = l.split(',');
      if (p.length >= 5) {
        const type = p[3].replace(/"/g, '').trim().toUpperCase();
        const addr = p[4].replace(/"/g, '').trim();
        if (type === 'IPV6') info.ipv6 = addr;
        else if (type === 'IPV4') info.ipv4 = addr;
      }
    }
    if (l.startsWith('+CGCONTRDP:')) {
      const p = l.split(',');
      if (p.length >= 3) info.apn = p[2]?.replace(/"/g, '') || '';
      if (p.length >= 4 && !info.ipv4 || info.ipv4 === '-') info.ipv4 = p[3]?.replace(/"/g, '') || '-';
    }
    if (l.startsWith('+QENG: "servingcell"')) {
      const g = l.replace('+QENG: "servingcell",', '').split(',').map(x => x.replace(/"/g, ''));
      info.network_mode = g[1] + (g[2] ? " " + g[2] : "");
      info.mccmnc = info.mccmnc === '-' ? `${g[3]}${g[4]}` : info.mccmnc;
      info.cellID = g[5];
      if (g[1] === 'NR5G-SA') {
        info.pcc_pci = g[6]; info.earfcns = g[8]; info.bands = g[9];
        info.bandwidth = `${bwMap(g[10])} MHz`;
        info.rsrpNR = g[11]; info.rsrqNR = g[12]; info.sinrNR = g[13];
      } else if (g[1] === 'LTE') {
        info.pcc_pci = g[6]; info.earfcns = g[7]; info.bands = 'B' + g[8];
        info.rsrpLTE = g[12]; info.rsrqLTE = g[13]; info.rssi = g[14]; info.sinrLTE = g[15];
      }
    }
    if (l.includes('"nr5g_ambr"') && !l.includes('IMS')) {
      const p = l.split(',');
      if (p.length >= 5) {
        info.nr5g_dl_ambr = parseFloat(p[3]) || 0;
        info.nr5g_ul_ambr = parseFloat(p[5]) || 0;
        info.nr5g_qci = p[2];
      }
    }
    if (l.startsWith('+QRSRP:')) {
      const p = l.split(',');
      info.prxqrsrp = p[0]?.split(':')[1]?.trim();
      info.drxqrsrp = p[1]; info.rx2qrsrp = p[2]; info.rx3qrsrp = p[3];
    }
    if (l.includes('"up/down"')) {
      const p = l.split(',');
      if (p.length >= 4) {
        info.netSpeedUp = ((parseInt(p[1]) || 0) / 1e6).toFixed(2);
        info.netSpeedDown = ((parseInt(p[2]) || 0) / 1e6).toFixed(2);
      }
    }
  });
  return info;
}

function bwMap(code) {
  const m = {0:'5',1:'10',2:'15',3:'20',4:'25',5:'30',6:'40',7:'50',8:'60',9:'70',10:'80',11:'90',12:'100',13:'200',14:'400'};
  return m[code] || code;
}