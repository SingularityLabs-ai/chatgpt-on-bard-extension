const Global = () => { }

export default Global;

Global.var = 100;

Global.func = () => {
    Global.var += 1;
    alert(Global.var);
}
