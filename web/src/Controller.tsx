import { useEffect, useRef, useState } from "react"
import { useControllerStore } from "./store/useStore";
import ReconnectingWebSocket from "reconnecting-websocket";
// import ip from "ip";

const Input = (label: string, id:string, value:string, ref:React.RefObject<HTMLInputElement>) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">{label}</label>
      <input type="text" id={id} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" defaultValue={value} ref={ref}/>
    </div>
  )
}

const InputNumber = (label: string, id:string, defaultValue:number, ref:React.RefObject<HTMLDivElement>) => {
  const [count,setCount] = useState(defaultValue);
  return (
    <div className="w-[13vw]">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="relative flex items-center">
        <button type="button" id="decrement-button" onClick={() =>setCount(c => c-1)} data-input-counter-decrement="bedrooms-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
            </svg>
        </button>
        <div className="pb-1 justify-center items-center bg-gray-50 border-x-0 border-gray-300 h-11 font-bold text-center text-gray-900 text-lg focus:ring-blue-500 focus:border-blue-500 flex w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ref={ref}>
          {count}
        </div>
        <button type="button" id="increment-button" onClick={() => setCount(c => c+1)} data-input-counter-increment="bedrooms-input" className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-3 h-11 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none">
            <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
            </svg>
        </button>
      </div>
    </div>
  )
}
const Select = (label: string, id:string, options: string[],defaultValue:string, ref:React.RefObject<HTMLSelectElement>) => {
  return(
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      <select id={id} defaultValue={defaultValue} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ref={ref}>
        {options.map(option => <option key={option} defaultValue={option}>{option}</option>)}
      </select>
    </div>
  )
}
const Controller = () => {
  const ref_title = useRef<HTMLInputElement>(null);
  const ref_blue_teamName = useRef<HTMLInputElement>(null);
  const ref_orange_teamName = useRef<HTMLInputElement>(null);
  const ref_blue_setPoint = useRef<HTMLDivElement>(null);
  const ref_orange_setPoint = useRef<HTMLDivElement>(null);
  const ref_bo = useRef<HTMLSelectElement>(null);

  const title = useControllerStore(state => state.title);
  const blue_teamName = useControllerStore(state => state.blue_teamName);
  const orange_teamName = useControllerStore(state => state.orange_teamName);
  const blue_setPoint = useControllerStore(state => state.blue_setPoint);
  const orange_setPoint = useControllerStore(state => state.orange_setPoint);
  const bo = useControllerStore(state => state.bo);

  const updateTitle = useControllerStore(state => state.updateTitle);
  const updateBlueTeamName = useControllerStore(state => state.updateBlueTeamName);
  const updateOrangeTeamName = useControllerStore(state => state.updateOrangeTeamName);
  const updateBlueSetPoint = useControllerStore(state => state.updateBlueSetPoint);
  const updateOrangeSetPoint = useControllerStore(state => state.updateOrangeSetPoint);
  const updateBo = useControllerStore(state => state.updateBo);
  const socketRef = useRef<ReconnectingWebSocket>();
  // const title = useStore(controllerStore,(state) => state.title);
  // const updateTitle = useStore(controllerStore,(state) => state.updateTitle);
  // console.log(ip.address());
  useEffect(() => {
    // urlのhost名からwsの接続先を取得
    const address = location.hostname;
    const websocket = new ReconnectingWebSocket(`ws://${address}:8001/controller`);
    socketRef.current = websocket;

    return () => {
      websocket.close();
    }
  },[]);
  const submit = () => {
    updateTitle(ref_title.current?.value || "");
    updateBlueTeamName(ref_blue_teamName.current?.value || "");
    updateOrangeTeamName(ref_orange_teamName.current?.value || "");
    updateBlueSetPoint(parseInt(ref_blue_setPoint.current?.textContent || "0"));
    updateOrangeSetPoint(parseInt(ref_orange_setPoint.current?.textContent || "0"));
    updateBo(ref_bo.current?.value || "");
    console.log(ref_title.current?.value);
    console.log(ref_blue_teamName.current?.value);
    console.log(ref_orange_teamName.current?.value);
    console.log(ref_blue_setPoint.current?.textContent);
    console.log(ref_orange_setPoint.current?.textContent);
    console.log(ref_bo.current?.value);
    const sendData:{cmd:string,data:object} = {cmd:"",data:{}};
    sendData["cmd"] = "ascent";
    sendData["data"] = {
      title: ref_title.current?.value || "",
      blue_teamName: ref_blue_teamName.current?.value || "",
      orange_teamName: ref_orange_teamName.current?.value || "",
      blue_setPoint: parseInt(ref_blue_setPoint.current?.textContent || "0"),
      orange_setPoint: parseInt(ref_orange_setPoint.current?.textContent || "0"),
      bo: ref_bo.current?.value || "",
    }
    socketRef.current?.send(JSON.stringify(sendData));
  };
  return(
    <div>
      <div className="w-[95vw]">
        {/* <div className="grid grid-cols-5 gap-0">
          <div className="col-start-3 h-[1.15vw] bg-slate-100">aaa</div>
        </div> */}
        {/* <div className={`pt-[0.8vw] grid grid-cols-5 gap-0`}>
          {[1,2,3,4,5].map((i)=><div key={i} className="bg-cyan-300 h-12 opacity-60 border border-black"></div>)}
        </div> */}
      </div>
      <div className="mt-10 w-[95vw]">
        <div className="w-full flex justify-center font-bold text-3xl">Controller</div>
        <div>
          <div className="mx-auto">
            <div className="w-[30vw] mx-auto">{Input("Title","title",title,ref_title)}</div>
            <div className="flex mt-2 gap-2 justify-center">
              {Input("blue teamName","blue_teamName",blue_teamName,ref_blue_teamName)}
              {Input("orange teamName","orange_teamName",orange_teamName,ref_orange_teamName)}
            </div>
            <div className="flex mt-2 gap-2 justify-center">
              {InputNumber("blue setPoint","blue_setPoint",blue_setPoint,ref_blue_setPoint)}
              {InputNumber("orange setPoint","orange_setPoint",orange_setPoint,ref_orange_setPoint)}
            </div>
            <div className="mx-auto mt-2 w-[30vw] flex items-center justify-center">
              {Select("bo","bo",["Bo1","Bo3"],bo,ref_bo)}
            </div>
            <div className="flex justify-center">
              <button type="button" onClick={submit} className="mt-10  focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Controller;