



export const Debug = () => {
    const onclick = async() => {
        const elm = document.getElementById("input")! as HTMLInputElement;
        const data = elm.value;
        console.log(data);
        await window.app.sendSocketCommunication(data);
    }
    return(
        <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
            <h1 className="font-bold text-lg">
            Socket Connection
            </h1>
            <input id="input" className="border rounded-lg" type="text" />
            <button
            onClick={onclick}
            className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
            >
                send To Moca
            </button>
        </div>
    )
}