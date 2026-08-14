import { useState, useEffect } from 'react';
import useDeviceInfo from './hooks/useDeviceInfo';
import { Zap, Wifi, Download, Upload, Thermometer, Signal, Globe, Server, Antenna, Radio, Clock, Activity } from 'lucide-react';
import './App.css';

const LANG = {
  zh: {
    overview:'新版首页',home:'首页',network:'网络',settings:'设置',sms:'短信',devInfo:'设备信息',firmware:'固件管理',fan:'风扇管理',
    signal:'信号强度',quality:'质量',networkInfo:'网络信息',carrier:'运营商',mode:'网络模式',dlBw:'下行带宽',ulBw:'上行带宽',
    priority:'优先级',cellId:'基站ID',ipv4:'IPv4',ipv6:'IPv6',temp:'温度',online:'已连接',offline:'离线',
    rsrp:'RSRP',sinr:'SINR',rsrq:'RSRQ',chanConfig:'频段配置',band:'频段',bandwidth:'带宽',arfcn:'ARFCN',pci:'PCI',
    antenna:'天线分集',main:'MAIN',div:'DIV',mimo1:'MIMO 1',mimo2:'MIMO 2',
    cellular5g:'5G 蜂窝网络',cellular4g:'4G 蜂窝网络',download:'下行速率',upload:'上行速率',mbps:'Mbps',
    greeting:{night:'夜深了',morning:'早上好',noon:'中午好',afternoon:'下午好',evening:'晚上好'},
    switchLang:'切换语言',switchTheme:'切换主题'
  },
  en: {
    overview:'Overview',home:'Home',network:'Network',settings:'Settings',sms:'SMS',devInfo:'Device Info',firmware:'Firmware',fan:'Fan Control',
    signal:'Signal Strength',quality:'Quality',networkInfo:'Network Info',carrier:'Carrier',mode:'Network Mode',dlBw:'DL Bandwidth',ulBw:'UL Bandwidth',
    priority:'Priority',cellId:'Cell ID',ipv4:'IPv4',ipv6:'IPv6',temp:'Temp',online:'Online',offline:'Offline',
    rsrp:'RSRP',sinr:'SINR',rsrq:'RSRQ',chanConfig:'Channel Config',band:'Band',bandwidth:'BW',arfcn:'ARFCN',pci:'PCI',
    antenna:'Antenna',main:'MAIN',div:'DIV',mimo1:'MIMO 1',mimo2:'MIMO 2',
    cellular5g:'5G Cellular',cellular4g:'4G Cellular',download:'DOWNLOAD',upload:'UPLOAD',mbps:'Mbps',
    greeting:{night:'Good Night',morning:'Good Morning',noon:'Good Noon',afternoon:'Good Afternoon',evening:'Good Evening'},
    switchLang:'Switch',switchTheme:'Theme'
  }
};

function NavBar({ isDark, toggleDark, lang, toggleLang }) {
  const t = LANG[lang];
  const links = [
    {label:t.network,href:'/network.html'},{label:t.settings,href:'/settings.html'},
    {label:t.sms,href:'/sms.html'},{label:t.devInfo,href:'/deviceinfo.html'},{label:t.firmware,href:'/firmware.html'}
  ];
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="nav-links">
          <span className="nav-active">{t.home}</span>
          {links.map(l=><a key={l.href} href={l.href} className="nav-link">{l.label}</a>)}
        </div>
        <div className="nav-actions">
          <button onClick={toggleLang} className="nav-btn" title={t.switchLang}><Globe size={16}/><span className="lang-code">{lang}</span></button>
          <button onClick={toggleDark} className="nav-btn" title={t.switchTheme}>{isDark?'☀':'🌙'}</button>
        </div>
      </div>
    </nav>
  );
}

function TimeGreeting({ lang }) {
  const [time, setTime] = useState({h:'--',m:'--',s:'--',date:'',greeting:''});
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const g = LANG[lang].greeting;
      setTime({
        h: String(h).padStart(2,'0'), m: String(now.getMinutes()).padStart(2,'0'), s: String(now.getSeconds()).padStart(2,'0'),
        date: now.toLocaleDateString(lang==='zh'?'zh-CN':'en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),
        greeting: h<5?g.night:h<11?g.morning:h<13?g.noon:h<18?g.afternoon:g.evening
      });
    };
    update(); const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [lang]);
  return (
    <div className="time-card">
      <div className="time-greeting">{time.greeting}</div>
      <div className="time-clock">
        <span className="time-digits">{time.h}</span><span className="time-colon">:</span>
        <span className="time-digits">{time.m}</span><span className="time-colon blink">:</span>
        <span className="time-digits time-sec">{time.s}</span>
      </div>
      <div className="time-date">{time.date}</div>
    </div>
  );
}

function ProgressBar({label,subLabel,unit,value,color}) {
  const pct = Math.min(100,Math.max(0,value));
  const bg = color==='auto'?(pct>70?'var(--green)':pct>40?'var(--yellow)':'var(--red)'):color;
  return (<div className="prog-item"><div className="prog-head"><span className="prog-label">{label}</span><span className="prog-val">{subLabel} {unit}</span></div><div className="prog-track"><div className="prog-fill" style={{width:`${pct}%`,background:bg}}/></div></div>);
}

function InfoRow({icon:Icon,label,value,color,last}) {
  return (<div className={`info-row${last?' info-last':''}`}><div className="info-icon" style={{background:color}}><Icon size={14}/></div><div className="info-content"><span className="info-label">{label}</span><span className="info-value">{value}</span></div></div>);
}

function MetricCard({icon:Icon,label,value,color}) {
  return (<div className="metric"><div className="metric-icon" style={{background:color}}><Icon size={14}/></div><div><div className="metric-label">{label}</div><div className="metric-value">{value}</div></div></div>);
}

function Dashboard({lang,isDark}) {
  const {data,loading} = useDeviceInfo(lang);
  const t = LANG[lang];
  if (loading) return <div className="loading"><div className="spinner"/></div>;
  const isLTE = data.network_mode?.includes('LTE');
  const rsrpVal = isLTE?data.rsrpLTE:data.rsrpNR;
  const sinrVal = isLTE?data.sinrLTE:data.sinrNR;
  const rsrqVal = isLTE?data.rsrqLTE:data.rsrqNR;
  const sigColor = data.signalPct>70?'var(--green)':data.signalPct>40?'var(--yellow)':'var(--red)';

  return (
    <div className="dashboard">
      <TimeGreeting lang={lang}/>

      <div className="status-bar">
        <span className="st">{data.online?'●':'○'} {data.online?t.online:t.offline}</span>
        <span className="st">📶 {data.signalPct}%</span>
        <span className="st">🌡 {data.temperature}°C</span>
        <span className="st">{isLTE?'4G':'5G'} {data.network_mode}</span>
        <span className="st">🌐 {data.ipv4}</span>
      </div>

      <div className="section speed-section">
        <h3 className="section-title">{isLTE?t.cellular4g:t.cellular5g}</h3>
        <div className="speed-row">
          <div className="speed-item">
            <div className="speed-label"><Download size={12}/> {t.download}</div>
            <div className="speed-val">{Math.floor(parseFloat(data.netSpeedDown))}<span className="speed-dec">.{data.netSpeedDown.split('.')[1]||'00'}</span> <span className="speed-unit">{t.mbps}</span></div>
          </div>
          <div className="speed-item">
            <div className="speed-label"><Upload size={12}/> {t.upload}</div>
            <div className="speed-val">{Math.floor(parseFloat(data.netSpeedUp))}<span className="speed-dec">.{data.netSpeedUp.split('.')[1]||'00'}</span> <span className="speed-unit">{t.mbps}</span></div>
          </div>
        </div>
        <div className="wave-wrap" style={{opacity:isDark?0.25:0.12,transform:`scaleY(${Math.min(Math.max(Math.log10(parseFloat(data.netSpeedDown)+parseFloat(data.netSpeedUp)+1)*0.6,0.15),1.8)})`}}>
          <div className="wave-inner"><svg viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="var(--blue)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128V320H0Z"/></svg><svg viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="var(--blue)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128V320H0Z"/></svg></div>
        </div>
      </div>

      <div className="section signal-section">
        <div className="section-head"><h3>{t.signal}</h3><span className="sig-badge" style={{background:sigColor}}>{data.signalPct}% {data.quality}</span></div>
        <ProgressBar label="RSRP" subLabel={rsrpVal} unit="dBm" value={data.rsrpPct} color="auto"/>
        <ProgressBar label="SINR" subLabel={sinrVal} unit="dB" value={data.sinrPct} color="auto"/>
        <ProgressBar label="RSRQ" subLabel={rsrqVal} unit="dB" value={data.rsrqPct} color="auto"/>
        <div className="sig-ring-wrap">
          <div className="sig-ring"><svg viewBox="0 0 128 128"><circle cx="64" cy="64" r="54" fill="none" stroke="var(--ring-bg)" strokeWidth="8"/><circle cx="64" cy="64" r="54" fill="none" stroke={sigColor} strokeWidth="8" strokeDasharray={`${data.signalPct*3.39} 339`} strokeLinecap="round" style={{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dasharray 1s'}}/></svg><div className="ring-center"><span className="ring-num">{data.signalPct}</span><span className="ring-lbl">{t.quality}</span></div></div>
        </div>
        <h4 className="sub-title">{t.chanConfig}</h4>
        <div className="metric-row">
          <MetricCard icon={Radio} label={t.band} value={data.bands} color="var(--purple)"/>
          <MetricCard icon={Activity} label={t.bandwidth} value={data.bandwidth} color="var(--indigo)"/>
          <MetricCard icon={Wifi} label={t.arfcn} value={data.earfcns} color="var(--pink)"/>
          <MetricCard icon={Server} label={t.pci} value={data.pcc_pci} color="var(--orange)"/>
        </div>
        <h4 className="sub-title">{t.antenna}</h4>
        <div className="ant-row">
          <div className="ant-box"><div className="ant-lbl">{t.main}</div><div className="ant-val">{data.prxqrsrp}</div></div>
          <div className="ant-box"><div className="ant-lbl">{t.div}</div><div className="ant-val">{data.drxqrsrp}</div></div>
          <div className="ant-box"><div className="ant-lbl">{t.mimo1}</div><div className="ant-val">{data.rx2qrsrp}</div></div>
          <div className="ant-box"><div className="ant-lbl">{t.mimo2}</div><div className="ant-val">{data.rx3qrsrp}</div></div>
        </div>
      </div>

      <div className="section info-section">
        <h3 className="section-title">{t.networkInfo}</h3>
        <div className="info-list">
          <InfoRow icon={Signal} label={t.carrier} value={data.network_provider} color="var(--blue)"/>
          <InfoRow icon={Server} label="MCCMNC" value={data.mccmnc} color="var(--purple)"/>
          <InfoRow icon={Wifi} label={t.mode} value={data.network_mode} color="var(--green)"/>
          <InfoRow icon={Globe} label="APN" value={data.apn} color="var(--teal)"/>
          <InfoRow icon={Download} label={t.dlBw} value={`${data.nr5g_dl_ambr} Mbps`} color="var(--cyan)"/>
          <InfoRow icon={Upload} label={t.ulBw} value={`${data.nr5g_ul_ambr} Mbps`} color="var(--cyan-dark)"/>
          <InfoRow icon={Zap} label={t.priority} value={data.nr5g_qci} color="var(--violet)"/>
          <InfoRow icon={Server} label={t.cellId} value={data.cellID} color="var(--red)"/>
          <InfoRow icon={Globe} label={t.ipv4} value={data.ipv4} color="var(--gray)"/>
          <InfoRow icon={Globe} label={t.ipv6} value={data.ipv6} color="var(--gray-dark)"/>
          <InfoRow icon={Thermometer} label={t.temp} value={`${data.temperature} °C`} color="var(--teal)" last/>
        </div>
      </div>

      <div className="update-time"><Clock size={12}/> {data.lastUpdate}</div>
    </div>
  );
}

export default function App() {
  const [isDark,setIsDark] = useState(()=>{const v=localStorage.getItem('cpe_dashboard_dark');if(v===null)return window.matchMedia?.('(prefers-color-scheme:dark)').matches;return v==='true'});
  const [lang,setLang] = useState(()=>localStorage.getItem('cpe_dashboard_lang')||'zh');
  useEffect(()=>{document.documentElement.classList.toggle('dark',isDark);localStorage.setItem('cpe_dashboard_dark',String(isDark))},[isDark]);
  useEffect(()=>{localStorage.setItem('cpe_dashboard_lang',lang)},[lang]);
  return (<div className="app"><NavBar isDark={isDark} toggleDark={()=>setIsDark(!isDark)} lang={lang} toggleLang={()=>setLang(l=>l==='zh'?'en':'zh')}/><main><Dashboard lang={lang} isDark={isDark}/></main><footer className="footer"><div className="footer-line"/><p className="footer-text">SimpleAdmin</p></footer></div>);
}