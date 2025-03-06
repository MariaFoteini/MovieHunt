
var saved_states = [

    {
        name: "Prestige",
        state: '{\n\t"pos_objects": [\n\t\t"dbr:The_Prestige_(film)",\n\t\t"dbr:The_Dark_Knight_(film)"\n\t],\n\t"neg_objects": [],\n\t"pos_constrains": [],\n\t"neg_constrains": []\n}'
    },
    {
        name: "Carter",
        state: '{\n\t"pos_objects": [\n\t\t"dbr:Agent_Carter_(film)",\n\t\t"dbr:Captain_America:_The_First_Avenger"\n\t],\n\t"neg_objects": [],\n\t"pos_constrains": [\n\t\t{\n\t\t\t"prop": "rdf:type",\n\t\t\t"op": "=",\n\t\t\t"value": "dbo:Film"\n\t\t}\n\t],\n\t"neg_constrains": []\n}'
    },
    {
        name: "Before",
        state: '{\n\t"pos_objects": [\n\t\t"dbr:Before_Sunset",\n\t\t"dbr:Before_Midnight"\n\t],\n\t"neg_objects": [],\n\t"pos_constrains": [],\n\t"neg_constrains": []\n}'
    }
]
var saved_states_index = 0;


document.querySelector('[data-value="filter_info"]').onclick = () => {

    var entry = saved_states[(saved_states_index += 1) % saved_states.length]
    console.log("Load saved state", entry.name);

    state = JSON.parse(entry.state)
    state.mode = ModeSystem;
    work(state);
}
