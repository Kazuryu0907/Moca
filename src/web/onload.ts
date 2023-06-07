    const getTeam = async () => {
    type TeamType = {
        blue:string,
        orange:string
    }
    const data:TeamType = await window.app.index2render("getTeam");
    document.getElementById("blueName")!.textContent = data.blue;
    document.getElementById("orangeName")!.textContent = data.orange;
    console.log(`blue:${data.blue} orange:${data.orange}`);
  }
  
  const teamButtonElm= <HTMLButtonElement>document.getElementById("getTeam");
  teamButtonElm.addEventListener("click",getTeam);