import { FC, useEffect, useMemo, useState } from "react";
import { Loading, Checked ,Failed} from "./Loading";
import {useNavigate} from "react-router-dom";

type stateType = "loading" | "success" | "fail" | "none";

type propsType = {
  env: stateType;
  auth: stateType;
  fetch: stateType;
  errorText: String;
};


const loadingCss = "w-7 h-7 text-gray-200 animate-spin fill-blue-600";
const checkedCss = "w-7 h-7 text-green-500 flex-shrink-0";
const failedCss = "w-7 h-7 text-red-500 font-bold";
type stepProps = {
  title: string;
  description: string;
  logo: JSX.Element;
  status: stateType;
};

const Step: FC<stepProps> = ({ title, description, status, logo }) => {
  const iconColor = status == "none" ? "bg-gray-500" : "bg-indigo-500";
  return (
    <div className="flex relative pb-12">
      <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
        <div className="h-full w-1 bg-gray-200 pointer-events-none"></div>
      </div>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${iconColor} inline-flex items-center justify-center text-white relative z-10`}
      >
        {logo}
      </div>
      <div className="flex-grow pl-4">
        <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">
          {title}
        </h2>
        <p className="leading-relaxed">{description}</p>
      </div>
      {status === "loading" ? (
        <Loading css={loadingCss} className="my-auto" />
      ) : (
        false
      )}
      {status === "success" ? (
        <Checked css={checkedCss} className="my-auto" />
      ) : (
        false
      )}
      {status === "fail" ? <Failed css={failedCss} className="my-auto"/> : false}
    </div>
  );
};

export const Start = () => {
  const [envStatus, setEnvStatus] = useState<propsType>({
    env: "loading",
    auth: "none",
    fetch: "none",
    errorText: "",
  });
  const navi = useNavigate();
  window.app.on(
    "startStepper",
    (e: Electron.IpcRendererEvent, data: propsType) => {
      console.log(data);
      setTimeout(function(){
        setEnvStatus(data);
      }, 1000);
      if(data.fetch === "success"){
        setTimeout(() => navi("/overlay"),2000);
      }
    }
  );

  const logoFile = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );
  };
  const logoGoogle = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    );
  };
  const logoSever = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
        />
      </svg>
    );
  };

  return (
    <div className="flex">
      <section className="text-gray-600 body-font w-full">
        <div className="p-10 flex">
          <div className="w-full">
            <div className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6">
              <Step
                title="STEP 1"
                description="Read Config File..."
                logo={logoFile()}
                status={envStatus.env}
              />
              <Step
                title="STEP 2"
                description="Authenticate Services..."
                logo={logoGoogle()}
                status={envStatus.auth}
              />
              <Step
                title="STEP 3"
                description="Fetch Initial Data..."
                logo={logoSever()}
                status={envStatus.fetch}
              />
              <div className="flex relative">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${
                    envStatus.fetch === "success"
                      ? "bg-indigo-500"
                      : "bg-gray-500"
                  } inline-flex items-center justify-center text-white relative z-10`}
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">
                    FINISH
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-10 text-[30px] text-red-600">{envStatus.errorText}</div>
      </section>
    </div>
  );
};
