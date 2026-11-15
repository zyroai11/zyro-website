import{a as w,b as l}from"./c-DZIUFIFM.js";import{c as s}from"./c-NLSMYY3E.js";import{A as i,s as y,y as x}from"./c-QEWQY3B6.js";import{Eb as m,Fa as g,Ga as d,zb as h}from"./c-EREL3REL.js";import{a as T,b as z}from"./c-WMUSMS6E.js";import{u as f}from"./c-DZAKPEP3.js";import{f as u}from"./c-CJFUG6WT.js";var n=u(T(),1);var b=u(z(),1);var R=e=>{let[t,o]=(0,n.useState)("auto");return(0,n.useEffect)((()=>{let r=new ResizeObserver((a=>{o(a[0]?.contentRect.height??"auto")}));return e.current&&r.observe(e.current),()=>{e.current&&r.unobserve(e.current)}}),[e.current]),t},U=l.div`
  text-align: left;
  flex-grow: 1;
`,D=l.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-grow: 1;
`,I=l.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* for Internet Explorer, Edge */
  -ms-overflow-style: none;

  /* for Firefox */
  scrollbar-width: none;

  /* for Chrome, Safari, and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
`,F=l(I)`
  ${e=>e.$colorScheme==="light"?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":e.$colorScheme==="dark"?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 3px;
`,k=w`
  && {
    width: 100%;
    font-size: 16px;
    line-height: 24px;
    min-height: 56px;

    /* Tablet and Up */
    @media (min-width: 440px) {
      font-size: 14px;
    }

    display: flex;
    gap: 12px;
    align-items: center;
    color: var(--privy-color-foreground);

    padding: 10px 12px;
    border: 1px solid var(--privy-color-foreground-4) !important;
    border-radius: var(--privy-border-radius-md);
    transition: background-color 200ms ease;

    cursor: pointer;

    &:hover {
      background-color: var(--privy-color-background-2);
    }

    &:disabled {
      cursor: pointer;
      background-color: var(--privy-color-background-2);
    }
  }
`,G=l.div`
  text-align: center;
  font-size: 14px;
  margin-bottom: 24px;
`,L=l.button.attrs({className:"login-method-button"})`
  ${k}
`;l.a`
  ${k}
`;var q=l.div`
  width: 32px;
  height: 32px;
  border-radius: ${e=>e.$fullSize?"0":"4px"};
  background: ${e=>e.$fullSize?"transparent":"var(--privy-color-background-2)"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: ${e=>e.$fullSize?"32px":"18px"};
    height: ${e=>e.$fullSize?"32px":"18px"};
    color: ${e=>e.$fullSize?"inherit":"var(--privy-color-icon-muted)"};
  }
`,B=l.div`
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  ${e=>e.$if?"display: none;":""}
`,J=l.div`
  width: 100%;
  height: 100%;
  padding: ${e=>e.$withPadding?"64px 0px":"0px"};
`,K=l.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  gap: 12px;
  & h3 {
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
  }
  & p {
    max-width: 300px;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
`;async function Q(e,t,o){if(!t.shouldEnforceDefaultChainOnConnect)return;let r=Number(e.chainId.replace("eip155:",""));if(!t.chains.find((a=>a.id===r))&&(e.connectorType!=="wallet_connect_v2"||e.walletClientType!=="metamask")){o?.();try{await e.switchChain(t.defaultChain.id),e.chainId=y(f(t.defaultChain.id))}catch{x.warn("Unable to switch to default chain after connect",{chainId:t.defaultChain.id})}}}var $=(0,n.createContext)({}),V=({children:e})=>{let t=h(),[o,r]=(0,n.useState)({});return s("login",{onComplete:({loginAccount:a})=>{a&&a.type!=="passkey"&&a.type!=="cross_app"&&(a.type!=="wallet"||a.walletClientType!=="privy")&&(i.put(v(t.id),a.type),a.type==="wallet"?(i.put(c(t.id),a.walletClientType),i.put(p(t.id),a.chainType),r({accountType:a.type,walletClientType:a.walletClientType,chainType:a.chainType})):(i.del(c(t.id)),i.del(p(t.id)),r({accountType:a.type})))}}),(0,n.useEffect)((()=>{if(!t.id)return;let a=i.get(v(t.id)),S=i.get(c(t.id)),C=i.get(p(t.id));a&&r(a==="wallet"?{accountType:a,walletClientType:S,chainType:C}:{accountType:a})}),[t.id]),(0,b.jsx)($.Provider,{value:o,children:e})},v=e=>`privy:${e}:recent-login-method`,c=e=>`privy:${e}:recent-login-wallet-client`,p=e=>`privy:${e}:recent-login-chain-type`,X=()=>(0,n.useContext)($),Y=e=>{s("fundWallet",e);let{fundWallet:t}=g();return{fundWallet:({address:o,options:r})=>t(o,r)}};function Z(e){let{logout:t}=(0,n.useContext)(m);return s("logout",e),{logout:t}}var W=d((()=>({isModalOpen:!1,resolvers:null}))),ee=d((()=>({})));var te=({address:e,client:t,appId:o})=>{let r=`${t}:${e}`;o&&i.put(j(o),r),W.setState({wallet:r})};var j=e=>`privy:${e}:active-wallet-connection`;export{R as a,U as b,D as c,I as d,F as e,G as f,L as g,q as h,B as i,J as j,K as k,Q as l,V as m,X as n,Y as o,Z as p,te as q};
