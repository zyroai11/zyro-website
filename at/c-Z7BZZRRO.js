import{a as H}from"./c-NUOXY45F.js";import{a as X}from"./c-OBRI7EOJ.js";import{a as Y}from"./c-LY2VX2VS.js";import{a as Q}from"./c-NTQRCP2D.js";import{c as Z}from"./c-HASXNJAM.js";import{a as z}from"./c-I23Z23IM.js";import"./c-OUW5CWBA.js";import"./c-VCEOSYAB.js";import"./c-E5JLMEDD.js";import"./c-YWJGPCZV.js";import"./c-3RWNX7T6.js";import"./c-CI4Y2PA4.js";import"./c-U2BLRFTO.js";import"./c-AZMMZBGQ.js";import"./c-YJCBU2PH.js";import"./c-PNOGQ52D.js";import"./c-G3JM4JSJ.js";import{b as E}from"./c-DZIUFIFM.js";import"./c-LDOFLXQW.js";import"./c-OGWN5SIW.js";import"./c-NLSMYY3E.js";import{a as se}from"./c-QEWQY3B6.js";import"./c-WN65RVUV.js";import{b as h,h as g,l as K}from"./c-ENWVGY26.js";import"./c-6P75ZRUL.js";import"./c-FKNR4ZMH.js";import{Db as q,Fa as B,Fb as V,Va as U,zb as P}from"./c-EREL3REL.js";import"./c-AE2PCOBC.js";import{a as j,b as ie}from"./c-WMUSMS6E.js";import"./c-Y44GWGFW.js";import"./c-CHIOLOH5.js";import"./c-LRSYAYZZ.js";import"./c-BX3KG5ID.js";import"./c-DZAKPEP3.js";import"./c-EKOG4TLM.js";import"./c-XF7FFNMB.js";import"./c-2HUIGDKY.js";import"./c-D366KCNC.js";import"./c-FHULG4TZ.js";import"./c-NNYV43OY.js";import"./c-H5RUSPC2.js";import"./c-DBE6YW6D.js";import"./c-XIUU7A2J.js";import"./c-4ERX45K7.js";import{f as R}from"./c-CJFUG6WT.js";var r=R(ie(),1);var w=R(j(),1);function le({title:o,titleId:d,...S},u){return w.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:u,"aria-labelledby":d},S),o?w.createElement("title",{id:d},o):null,w.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))}var ce=w.forwardRef(le),G=ce;var n=R(j(),1),oe=R(se(),1);var de=({contactMethod:o,authFlow:d,emailDomain:S,appName:u="Privy",whatsAppEnabled:k=!1,onBack:b,onCodeSubmit:I,onResend:D,errorMessage:x,success:y=!1,resendCountdown:M=0,onInvalidInput:L,onClearError:N,resetCodeSignal:T})=>{let[p,m]=(0,n.useState)(ee);(0,n.useEffect)((()=>{m(ee)}),[T]);let O=async l=>{l.preventDefault();let i=l.currentTarget.value.replace(" ","");if(i==="")return;if(isNaN(Number(i)))return void L?.("Code should be numeric");N?.();let s=Number(l.currentTarget.name?.charAt(5)),a=[...i||[""]].slice(0,J-s),f=[...p.slice(0,s),...a,...p.slice(s+a.length)];m(f);let v=Math.min(Math.max(s+a.length,0),J-1);isNaN(Number(l.currentTarget.value))||document.querySelector(`input[name=code-${v}]`)?.focus(),f.every((c=>c&&!isNaN(+c)))&&(document.querySelector(`input[name=code-${v}]`)?.blur(),await I?.(f.join("")))};return(0,r.jsx)(z,{title:"Enter confirmation code",subtitle:(0,r.jsxs)("span",d==="email"?{children:["Please check ",(0,r.jsx)(re,{children:o})," for an email from"," ",S??"privy.io"," and enter your code below."]}:{children:["Please check ",(0,r.jsx)(re,{children:o})," for a",k?" WhatsApp":""," message from ",u," and enter your code below."]}),icon:d==="email"?X:Y,onBack:b,showBack:!0,helpText:(0,r.jsxs)(he,{children:[(0,r.jsxs)("span",{children:["Didn't get ",d==="email"?"an email":"a message","?"]}),M?(0,r.jsxs)(ge,{children:[(0,r.jsx)(G,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),(0,r.jsx)("span",{children:"Code sent"})]}):(0,r.jsx)(Q,{as:"button",size:"sm",onClick:D,children:"Resend code"})]}),children:(0,r.jsx)(me,{children:(0,r.jsx)(Z,{children:(0,r.jsxs)(fe,{children:[(0,r.jsx)("div",{children:p.map(((l,i)=>(0,r.jsx)("input",{name:`code-${i}`,type:"text",value:p[i],onChange:O,onKeyUp:s=>{s.key==="Backspace"&&(a=>{N?.(),m([...p.slice(0,a),"",...p.slice(a+1)]),a>0&&document.querySelector(`input[name=code-${a-1}]`)?.focus()})(i)},inputMode:"numeric",autoFocus:i===0,pattern:"[0-9]",className:`${y?"success":""} ${x?"fail":""}`,autoComplete:oe.isMobile?"one-time-code":"off"},i)))}),(0,r.jsx)(ve,{$fail:!!x,$success:y,children:(0,r.jsx)("span",{children:x==="Invalid or expired verification code"?"Incorrect code":x||(y?"Success!":"")})})]})})})})},J=6,ee=Array(6).fill(""),C,A,ue=((C=ue||{})[C.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",C[C.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",C),pe=((A=pe||{})[A.EMAIL=0]="EMAIL",A[A.SMS=1]="SMS",A),ke={component:()=>{let{navigate:o,lastScreen:d,navigateBack:S,setModalData:u,onUserCloseViaDialogOrKeybindRef:k}=q(),b=P(),{closePrivyModal:I,resendEmailCode:D,resendSmsCode:x,getAuthMeta:y,loginWithCode:M,updateWallets:L,createAnalyticsEvent:N}=B(),{authenticated:T,logout:p,user:m}=V(),{whatsAppEnabled:O}=P(),[l,i]=(0,n.useState)(!1),[s,a]=(0,n.useState)(null),[f,v]=(0,n.useState)(null),[c,$]=(0,n.useState)(0),[ae,te]=(0,n.useState)(0);k.current=()=>null;let _=y()?.email?0:1,F=_===0?y()?.email||"":y()?.phoneNumber||"",W=U-500;return(0,n.useEffect)((()=>{if(c){let t=setTimeout((()=>{$(c-1)}),1e3);return()=>clearTimeout(t)}}),[c]),(0,n.useEffect)((()=>{if(T&&l&&m){if(b?.legal.requireUsersAcceptTerms&&!m.hasAcceptedTerms){let t=setTimeout((()=>{o("AffirmativeConsentScreen")}),W);return()=>clearTimeout(t)}if(H(m,b.embeddedWallets)){let t=setTimeout((()=>{u({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),N({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"AwaitingPasswordlessCodeScreen"}}),p()},callAuthOnSuccessOnClose:!0}}),o("EmbeddedWalletOnAccountCreateScreen")}),W);return()=>clearTimeout(t)}{L();let t=setTimeout((()=>I({shouldCallAuthOnSuccess:!0,isSuccess:!0})),U);return()=>clearTimeout(t)}}}),[T,l,m]),(0,n.useEffect)((()=>{if(s&&f===0){let t=setTimeout((()=>{a(null),v(null),te((ne=>ne+1)),document.querySelector("input[name=code-0]")?.focus()}),1400);return()=>clearTimeout(t)}}),[s,f]),(0,r.jsx)(de,{contactMethod:F,authFlow:_===0?"email":"sms",emailDomain:b?.appearance.emailDomain,appName:b?.name,whatsAppEnabled:O,onBack:()=>S(),onCodeSubmit:async t=>{try{await M(t),i(!0)}catch(e){if(e instanceof h&&e.privyErrorCode===g.INVALID_CREDENTIALS)a("Invalid or expired verification code"),v(0);else if(e instanceof h&&e.privyErrorCode===g.CANNOT_LINK_MORE_OF_TYPE)a(e.message);else{if(e instanceof h&&e.privyErrorCode===g.USER_LIMIT_REACHED)return console.error(new K(e).toString()),void o("UserLimitReachedScreen");if(e instanceof h&&e.privyErrorCode===g.USER_DOES_NOT_EXIST)return void o("AccountNotFoundScreen");if(e instanceof h&&e.privyErrorCode===g.LINKED_TO_ANOTHER_USER)return u({errorModalData:{error:e,previousScreen:d??"AwaitingPasswordlessCodeScreen"}}),void o("ErrorScreen",!1);if(e instanceof h&&e.privyErrorCode===g.DISALLOWED_PLUS_EMAIL)return u({inlineError:{error:e}}),void o("ConnectOrCreateScreen",!1);if(e instanceof h&&e.privyErrorCode===g.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return u({accountTransfer:{nonce:e.data?.data?.nonce,account:F,displayName:e.data?.data?.account?.displayName,linkMethod:_===0?"email":"sms",embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress}}),void o("LinkConflictScreen");a("Issue verifying code"),v(0)}}},onResend:async()=>{$(30),_===0?await D():await x()},errorMessage:s||void 0,success:l,resendCountdown:c,onInvalidInput:t=>{a(t),v(1)},onClearError:()=>{f===1&&(a(null),v(null))},resetCodeSignal:ae})}},me=E.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,fe=E.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0);
    }
    33% {
      transform: translate(-1px, 0);
    }
    67% {
      transform: translate(-1px, 0);
    }
    100% {
      transform: translate(1px, 0);
    }
  }
`,ve=E.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${o=>o.$success?"var(--privy-color-success-dark)":o.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,he=E.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,ge=E.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,re=E.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`;export{ke as AwaitingPasswordlessCodeScreen,de as AwaitingPasswordlessCodeScreenView,ke as default};
