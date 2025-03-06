
function q(x) { return document.querySelector(x); }
function qa(x) { return document.querySelectorAll(x); }
function escape_code(x) { return x.replaceAll("'", "\\'").replaceAll("\"", "\\\""); }
function array_index(l, x) { if (typeof (x) != "object") return l.indexOf(x); for (var i = 0; i < l.length; i++) if (JSON.stringify(l[i]) == JSON.stringify(x)) return i; return -1; };
function array_toggle(l, x) { var i = array_index(l, x); if (i == -1) l.push(x); else l.splice(i, 1); }
var round = Math.round;

var show_top = 72;
var show_info = true;
var keyboard_lag = 300; //ms
var show_top = 72;
var index = 0;
const resultPerPage = 12; 
let fromIndex = 0;
let toIndex;

var url_params = new URLSearchParams(window.location.search);

var testing = location.search.indexOf('testing') != -1;

function html_prefix(x) {
    if (x.indexOf(Arrow) != -1) return html_prefix2(x);
    if (!x) return x;
    var index = 1 + x.indexOf(':');
    if (index == 0) return x;
    return `<span class="prefix" hidden>${x.slice(0, index)}</span><wbr><span class="postfix">${x.slice(index)}</span>`
}
function html_prefix2(x) {
    return x.split(Arrow).map((i) => html_prefix(i)).join(" → ");
}


var ModeKeyword = 'keyword';
var ModeSystem = 'system';
var Arrow = "→";

var hovers = {
    "ent_pos": "Consider this entity as wanted",
    "ent_neg": "Consider this entity as unwanted",
    "ent_pos_del": "Uncosinder this entity as wanted",
    "ent_neg_del": "Uncosinder this entity as unwanted",
    "prop_pos": "Consider this property-value as wanted",
    "prop_neg": "Consider this property-value as unwanted",
    "con_pos": "Consider this constrain correct",
    "con_sug_pos": "Consider this constrain correct instead",
    "con_neg": "Ignore this constrain",
    "con_invert": "Invert the constrain",
    "con_del": "Uncosinder this constrain as correct",
};
var messages = {
    "start_pos_2": "Select <b>at least one</b> entity before you continue.",
    "start_pos_1": "Select at one more entity before you continue.",
    "start_pos_1_suggestion": "Starting with more than one example is supported",
    "switch_to_expand": "Switch to the Expand tab to see the results.",
    "tip_tab1": "1. Find Examples<br>Find and select examples with keyword search",
    "tip_tab2": "2. Provide Feedback<br>You can provide feedback on both Constrains and Examples",
}

function popup_help() {
    window.open('https://youtu.be/k9OZ3vSaUmQ', '_blank');
}
function popup_about() {
    try_popup('?about');
    q("#path").innerText = "› about"

    q("#about").hidden = false;
    q(".main-container-content").hidden = true;
}
function popup_home() {
    location.href = '?'
}
function try_popup(href) {
    if (url_params.get("data") != null) {
        window.open(href, '_blank');
    } else {
        location.href = href;
    }
}


function attr_con_match(attr, con) {
    if (con.op == '!=') return false;
    if (con.prop != '?' && con.prop != attr[0]) return false;

    var con_attr = [null, con.value, label_of(con.value)]
    if (same_values(con_attr, attr)) return true;
}


function external_link(id) {
    var [pre, post] = id.split(":")
    if (pre == "sc") {
        return `<a href="https://www.scopus.com/record/display.uri?eid=2-s2.0-${post}&origin=resultslist" target="_blank">scopus</a>`
    } else {
        return `<a href="https://dbpedia.org/page/${post}" target="_blank">dbpedia</a>`
    }
}

$(document).ready(function(){
    $("#prevPage").click(function(){
        if(index - resultPerPage >= 0 ){
            $("#nextPage").removeAttr("disabled");
            index -= resultPerPage;
            fromIndex = index ;
            toIndex = index+resultPerPage;
            window.scrollTo({top: 0,behavior: 'smooth'});
            update_list(state, fromIndex, toIndex);
        }else {
            $("#prevPage").attr("disabled", true);
        }
        if(index - resultPerPage < 0) {
            $("#prevPage").attr("disabled", true);
        }
    });
    $("#nextPage").click(function(){
        if(index + resultPerPage <= show_top && index + resultPerPage <= state.objects.length ) {
            $("#prevPage").removeAttr("disabled");
            index += resultPerPage;
            fromIndex = index;
            toIndex = index+resultPerPage;
            window.scrollTo({top: 0,behavior: 'smooth'});
            update_list(state, fromIndex, toIndex);
        }else {
            $("#nextPage").attr("disabled", true);
        }
        if(index + resultPerPage > show_top || index + resultPerPage > state.objects.length ) {
            $("#nextPage").attr("disabled", true);

        }
    });
  });

function update_list(state, fromIndex, toIndex) {
    var html = "";

    function add(id, posl, negl, free) {
        var i = data[id];

        var ispos = posl.indexOf(id) != -1;
        var isneg = negl.indexOf(id) != -1;

        if ((free && ispos) || (free && isneg)) return;

        html +=
            `
		<div class="object ${ispos ? 'pos' : isneg ? 'neg' : ''}" data-id="${escape_code(id)}">
            <div class="poster" id="${escape_code(id)}" >
                <img class="findme" src="" loading="lazy" style="background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(media/default.png);">
                <span class="movie-name-poster">${i["rdfs:label"][0]}</span>
                <div class="additional-info">
                    <i class="icon star"></i>
                    <span class="rating">0.0</span>
                    <button class="button" disabled id="open-info" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#videoModal">Open</button>
                </div>
            </div>
        <div class="options">
				<div class="button" tabindex="0" role="button" data-button="pos" onclick="mod('object_pos','${escape_code(id)}')" title="${hovers.ent_pos}"><i class="icon thumbs-up"></i></div>
				<div class="button" tabindex="0" role="button" data-button="neg" onclick="mod('object_neg','${escape_code(id)}')" title="${hovers.ent_neg}"><i class="icon thumbs-down"></i></div>
				<div class="button" tabindex="0" role="button" data-button="del" data-button-of="pos" onclick="mod('object_pos','${escape_code(id)}')" title="${hovers.ent_pos_del}"></div>
				<div class="button" tabindex="0" role="button" data-button="del" data-button-of="neg" onclick="mod('object_neg','${escape_code(id)}')" title="${hovers.ent_neg_del}"></div>
			</div>
			<div class="label">${i["rdfs:label"][0]}</div>
			<div class="id" hidden>${html_prefix(id)} &nbsp;&bullet;&nbsp; ${external_link(id)}</div>
		`;

        if (show_info) {
            html += `
		<div class="info">
		`
            for (var attr of i["attrs"]) {
                var a = attr;
                if (attr[0] == "rdfs:label") continue;

                var matching = false;
                for (var con of state.pos_constrains) if (attr_con_match(attr, con)) { matching = true; break }
                for (var con of state.constrains) if (attr_con_match(attr, con)) { matching = true; break }

                var can_expand = attr[1] in data;
                var labely = (can_expand && label_of(attr[1]) != attr[2]) ? `<span class="labely"> › ${a[2]}</span>` : ""

                html += `
				<div class="attr ${matching ? "pos" : ""}" data-prop="${a[0]}" data-value="${a[1]}">
					<div class="prop">${html_prefix(a[0])}</div>
                    <div class="value-box">
                        <div class="value ${can_expand ? " expand" : ""}" title="${a[2]}">
                            <span ${can_expand ? ` onclick="attr_value_expand(this.parentElement, this.parentElement.parentElement.parentElement.parentElement, '${escape_code(id)}', '${a[0]}', '${a[1]}')"` : ""}>
                                ${html_prefix(a[1])}
                            </span> ${labely}
                        </div>
                        <div class="options">
                            <div style="display: flex">
                                <div class="button" tabindex="0" role="button" data-button="pos" onclick="mod('constrain_pos','${escape_code(a[0] + " = " + a[1])}'); on_user_con_add()" title="${hovers.prop_pos}" data-in-mode="keyword"><i class="icon thumbs-up"></i></div>
                                <div class="button" tabindex="0" role="button" data-button="neg" onclick="mod('constrain_neg','${escape_code(a[0] + " != " + a[1])}'); on_user_con_add()" title="${hovers.prop_neg}"><i class="icon thumbs-down"></i></div>
                            </div>
                        </div>
					</div>
				</div>
			`
            }
            html += `
			</div>
		`
        }

        html += `
		</div>
		`
    }

    //show_info = state.objects.length < show_top;

    var numOfObjects = state.objects.length;
    if (state.mode == ModeKeyword && state.objects.length > 0) {
        // show only the filtered
        $("#nextPage").removeAttr("disabled");

        for (var id of state.objects.slice(fromIndex, toIndex)){
            add(id, state.pos_objects, state.neg_objects, false)

        }
    } else {
        for (var id of state.pos_objects){
            add(id, state.pos_objects, state.neg_objects, false)
        }
        for (var id of state.objects.slice(fromIndex, toIndex)){
            add(id, state.pos_objects, state.neg_objects, true)
        }
        for (var id of state.neg_objects) {
            add(id, state.pos_objects, state.neg_objects, false)
        }
    }

    q('#list').innerHTML = html;
    q('[data-value="entities_info"]').innerHTML = `${parseFloat(state.objects.length).toLocaleString('en')}`;
    getMoviePoster();
}

function attr_value_expand(ele_value, ele_object, id, prop, value_id) {

    // toggle
    ele_value.classList.toggle("expanded");
    if (!ele_value.classList.contains("expanded")) {
        ele_value.removeChild(ele_value.querySelector(".expand-attrs"))
        return;
    }

    var i = data[value_id];

    var html = "";
    html += `<div class="expand-attrs">`

    for (var attr of i["attrs"]) {
        var a = attr;
        if (attr[0] == "rdfs:label") continue;

        var matching = false;
        // TODO deteck matching
        //for (var con of state.pos_constrains) if (attr_con_match(attr, con)) {matching = true; break}
        //for (var con of state.constrains) if (attr_con_match(attr, con)) {matching = true; break}

        var can_expand = attr[1] in data;
        var labely = (can_expand && label_of(attr[1]) != attr[2]) ? `<span class="labely"> › ${a[2]}</span>` : ""

        html += `
				<div class="attr ${matching ? "pos" : ""}" data-prop="${a[0]}" data-value="${a[1]}">
					<div class="prop">${html_prefix(a[0])}</div>
					<div class="value ${can_expand ? " expand" : ""}" title="${a[2]}">
						<span ${can_expand ? ` onclick="attr_value_expand(this.parentElement, this.parentElement.parentElement.parentElement.parentElement, '${id}', '${prop + Arrow + a[0]}', '${a[1]}')"` : ""}>
							${html_prefix(a[1])}
						</span> ${labely}
					</div>
					<div class="options">
						<div style="display: flex">
							<div class="button" tabindex="0" role="button" data-button="pos" onclick="mod('constrain_pos','${escape_code(prop + Arrow + a[0] + " = " + a[1])}'); on_user_con_add()" title="${hovers.prop_pos}">test  1</div>
							<!--<div class="button" tabindex="0" role="button" data-button="neg" onclick="mod('constrain_pos','${escape_code(a[0] + " != " + a[1])}'); on_user_con_add()" title="${hovers.prop_neg}">test 1.1</div
						</div>
					</div>
				</div>
			`
    }
    html += `</div>`

    ele_value.innerHTML += html
}

function update_constrains(state) {
    var html = "";

    function desc(con) {
        return `${html_prefix(con["prop"])} <b>&nbsp;${con["op"]}&nbsp;</b> ${html_prefix(con["value"])}`.replace("!=", "≠")
    }
    function value_label(con) {
        return con['value'] in data ? data[con['value']]['rdfs:label'] : label_of(con['value'])
    }

    function add_free(con) {
        html += `
		<div class="constrain-single">
			<div class="constrain free" title="${value_label(con)}">
				<div class="name">${desc(con)} </div>
			</div>
			<div class="options">
				<div class="button" tabindex="0" role="button" data-button="pos" onclick="mod('constrain_pos','${escape_code(con_sig(con))}')" title="${hovers.con_pos}"><i class="icon thumbs-up"></i></div>
				<div class="button" tabindex="0" role="button" data-button="neg" onclick="mod('constrain_neg','${escape_code(con_sig(con))}')" title="${hovers.con_neg}"><i class="icon thumbs-down"></i></div>
			</div>
		</div>`
    }

    function add(con, posneg) {
        html += `
		<div class="constrain-single">
			<div class="constrain ${posneg ? "pos" : "neg"}" title="${value_label(con)}">
				<div class="name">${desc(con)}</div>
			</div>
			<div class="options">`
        if (con.prop != 'self') html += `
				<div class="button" tabindex="0" role="button" data-button="inv" onclick="mod('constrain_${posneg ? "pos" : "neg"}_invert','${escape_code(con_sig(con))}')" title="${hovers.con_invert}"></div>`
        html += `
				<div class="button" tabindex="0" role="button" data-button="del" onclick="mod('constrain_${posneg ? "pos" : "neg"}_remove','${escape_code(con_sig(con))}')" title="${hovers.con_del}"></div>
			</div>
		</div>
		`
    }

    for (var con of state.pos_constrains) add(con, true)
    for (var con of state.constrains) add_free(con)
    for (var con of state.neg_constrains) add(con, false)

    if (html == "") html = `<div class="constrain-chain note">No constrains</div>`;

    q('#constrains .body').innerHTML = html;
    q('[data-value="constrains_info"]').innerHTML = `${state.pos_constrains.length + state.constrains.length}`;

    q('#sparql_query').innerText = constrains_to_sparql(state.constrains.concat(state.pos_constrains))
}

var state = {
    mode: ModeKeyword,
    filter: "",
    pos_objects: [],
    neg_objects: [],
    pos_constrains: [],
    neg_constrains: [],
    constrains: [],
    objects: []
}

function get_state_input() {
    return {
        pos_objects: state.pos_objects,
        neg_objects: state.neg_objects,
        pos_constrains: state.pos_constrains,
        neg_constrains: state.neg_constrains,
    }
}
function get_state_input_json() {
    return JSON.stringify(get_state_input(), null, '\t');
}


function reset_state(state) {
    state.mode = ModeKeyword;
    state.filter = "";
    state.pos_objects = [];
    state.neg_objects = [];
    state.pos_constrains = [];
    state.neg_constrains = [];
    state.constrains = [];
    state.objects = [];
}
reset_state(state);

function reset_all() {
    fromIndex = 0;
    q("#filter input").value = "";
    reset_state(state);
    change_mode(state.mode);
}
function reset_all_exit() {
    reset_all();
    location.href = location.href.replace(location.search, "");
}

function onEnter(a, b) { a.addEventListener("keydown", function (a) { 13 === a.keyCode && (b(a), a.preventDefault()) }) }
onEnter(q("#filter input"), () => filter_update(false));

function change_mode(new_mode) {

    if (new_mode == ModeSystem) {
        var x = state_is_min(state);
        if (x) return message_show(messages[x]);

    }

    if (new_mode == ModeKeyword) {
        setTimeout(() => q("#filter input").focus(), 300);
    }

    q(`.switch-item[data-selected]`).removeAttribute("data-selected");
    q(`.switch-item[data-mode="${new_mode}"]`).setAttribute("data-selected", true);

    q("body").setAttribute("data-mode", new_mode);
    window.scrollTo(0, 0);

    state.mode = new_mode;
    work(state);

    if (new_mode == ModeSystem) {
        if (message_show(messages['tip_tab2'], true)) return
    } else if (new_mode == ModeKeyword) {
        if (message_show(messages['tip_tab1'], true)) return
    }
    if (new_mode == ModeSystem && state.pos_objects.length == 1) {
        message_show(messages['start_pos_1_suggestion'], true);
    }
}

function state_is_min(state) {

    if (state.pos_objects.length >= 2 || state.pos_constrains.length > 0) return null;

    if (state.pos_objects.length == 1) return null; //"start_pos_1";
    return "start_pos_2";
}


function filter_update(oninput) {
    var filter = q("#filter input").value;
    state.filter = filter.trim();

    filter_update_post(!oninput || (state.filter.length == 0));

    q("#help").hidden = true;
}

$(document).ready(function() {
    $("#search").keyup(function(event) {
        if (event.keyCode === 13) { // 13 is the Enter key code
            var filter = q("#filter input").value;
            state.filter = filter.trim();
            filter_update_post((state.filter.length == 0));
            q("#help").hidden = true;
        }
    });
});
$(document).ready(function() {
    $("#search_button").click(function(){
        fromIndex = 0;
        var filter = q("#filter input").value;
        state.filter = filter.trim();
        filter_update_post((state.filter.length == 0));
        q("#help").hidden = true;
    });
});

var filter_update_post_id = null;
function filter_update_post(instant) {
    if (filter_update_post_id) {
        clearTimeout(filter_update_post_id);
        filter_update_post_id = null;
    }

    if (instant) {
        work(state);
    } else {
        filter_update_post_id = setTimeout(work, keyboard_lag, state);
    }
}


function mod(action, param) {

    if (action == "") {

    }
    else if (action == 'object_pos') array_toggle(state.pos_objects, param);
    else if (action == 'object_neg') array_toggle(state.neg_objects, param);
    else if (action == 'constrain_pos') state.pos_constrains.push(con_unsig(param));
    else if (action == 'constrain_neg') state.neg_constrains.push(con_unsig(param));
    else if (action == 'constrain_pos_remove') array_toggle(state.pos_constrains, con_unsig(param));
    else if (action == 'constrain_neg_remove') array_toggle(state.neg_constrains, con_unsig(param));
    else if (action == 'constrain_pos_invert') { state.pos_constrains[array_index(state.pos_constrains, con_unsig(param))] = con_invert(con_unsig(param)) }
    else if (action == 'constrain_neg_invert') { state.pos_constrains[array_index(state.neg_constrains, con_unsig(param))] = con_invert(con_unsig(param)) }

    work(state);
}

function on_user_con_add() {
    if (state.pos_constrains.length == 1 && state.mode == ModeKeyword) {
        message_show(messages["switch_to_expand"]);
    }
}

function work(state) {
    state.objects = [];
    state.constrains = [];
    if (state.filter == undefined) state.filter = "";

    if (state.mode == ModeKeyword) {

        var filter = state.filter.trim().toLowerCase();
        var label_re1 = new RegExp(`\\b${filter}\\b`, 'i');
        var label_re2 = new RegExp(`\\b${filter}`, 'i');
        var keywords = filter.split(/ +/);

        function has_keywords(text, keywords) {
            for (var i of keywords) {
                if (text.indexOf(i) == -1) return false;
            }
            return true;
        }

        if (filter.length > 0) {

            var all = Object.keys(data);
            var l1 = [], l2 = [], l3 = [], l4 = [];

            for (var id of all) {
                if (data[id]["rdfs:label"][0].search(label_re2) != -1) l1.push(id);
                else if (has_keywords(data[id]["rdfs:label"][0], keywords)) l2.push(id);
                else if (data[id]["raw"].indexOf(filter) != -1) l3.push(id);
                else if (has_keywords(data[id]["raw"], keywords)) l4.push(id);
            }

            all = [].concat.apply([], [l1, l2, l3, l4]);
            state.objects = all;

        } else {
            // TODO show message
        }
    } else { // state.mode == ModeSystem
        if (state.pos_objects.length > 0 || state.pos_constrains.length > 0) {
            actual_work(state)
        } else {
            // TODO show message
        }
    }
    update_list(state, fromIndex, fromIndex+resultPerPage);
    update_constrains(state)
    sessionStorage.ec = get_state_input_json()
    message_close();
}

function con_sig(con, general) {
    if (!con) return "";
    if (general) return `${con["prop"]} ${con["op"]} ${label_of(con["value"])}`;
    return `${con["prop"]} ${con["op"]} ${con["value"]}`;
}
function con_unsig(sig) {
    var p = sig.split(" ");
    return { prop: p[0], op: p[1], value: p.slice(2).join(" ") };
}

function con_copy(con) {
    return { prop: con["prop"], op: con["op"], value: con["value"] };
}
function con_invert(con) {
    if (!con) return con;
    return { prop: con["prop"], op: op_invert(con["op"]), value: con["value"] };
}
function op_invert(x) {
    return ({ '=': '!=', '!=': '=' })[x];
}

function con_try_add(cons, poss, negs, con) {
    con = con_fill(con)
    if (
        con_try_add_sub(cons, poss, negs, con) &&
        con_try_add_sub(cons, poss, negs, con_invert(con)) &&
        con_try_add_sub(cons, poss, negs, con.prev) &&
        con_try_add_sub(cons, poss, negs, con_invert(con.prev))
    ) {
        cons.push(con)
        return true;
    }
    return false;
}
function con_try_add_sub(cons, poss, negs, con) {
    if (!con) return true;
    var con_s = con_sig(con, true);
    for (var i of cons) if (con_s == con_sig(i, true)) return false;
    for (var i of poss) if (con_s == con_sig(i, true)) return false;
    for (var i of negs) if (con_s == con_sig(i, true)) return false;
    // TODO: collect all instead of just the .prev 
    for (var i of cons) if (con_s == con_sig(con_fill(i).prev, true)) return false;
    for (var i of poss) if (con_s == con_sig(con_fill(i).prev, true)) return false;
    for (var i of negs) if (con_s == con_sig(con_fill(i).prev, true)) return false;
    return true;
}

function con_fill(ocon) {
    var con = con_copy(ocon);
    if (ocon.prop == 'self') return con;

    if (ocon.prev) con.prev = ocon.prev;
    else if (con_prev(con)) {
        con.prev = con_prev(con)
    }

    if (ocon.next) con.next = ocon.next;

    return con;
}

function con_prev(con) {
    var prop = con["prop"], op = con["op"], value = con["value"];
    if ((op == '=' || op == '!=') && prop != '?') {
        return { prop: '?', op: op, value: value };
    }
    return;
}




function same_values(la, lb) {
    return (la[1] == lb[1] || la[2] == lb[2]);
}

function same_props(la, lb) {
    var a = la[0], b = lb[0]
    if (a == b) return true;
    if (a == null || b == null) return false;
    // TODO: support same as properties
    return false;
}

function find_subClassOf(x) {
    // TODO generate
    return {
        "dbo:Film": "dbo:Work",
        "dbo:Software": "dbo:Work",
        "dbo:VideoGame": "dbo:Software",
    }[x] || "owl:Thing";
}

function actual_work(state) {

    var negs = [].concat(state.neg_constrains)
    var poss = [].concat(state.pos_constrains);

    var cs = [];

    var current_objects = (state.pos_objects.length > 0) ? state.pos_objects : constrain_query(poss);

    // find the type constrain

    try { // TODO tmp
        var types = {}
        for (var id of current_objects) {
            for (var t of data[id]["rdf:type"]) types[t] = true;
        }
        types = Object.keys(types);

        if (types.length == 1) {
            var type = types[0];
            con_try_add(cs, poss, negs, {
                prop: "rdf:type", op: "=", value: type,
                prev: { // TODO: generate
                    prop: "rdf:type", op: "=", value: "dbo:Work",
                },
                //			next: { // TODO: generate
                //				prop: "rdf:type", op: "=", value: "dbo:ShortFilm",
                //			}
            })
        } else {
            for (var type of types) {
                var common = true;
                for (var id of current_objects) {
                    if (!data[id]["rdf:type"].includes(type)) {
                        common = false;
                        break;
                    }
                }
                if (common) {
                    con_try_add(cs, poss, negs, {
                        prop: "rdf:type", op: "=", value: type,
                        prev: { // TODO: generate
                            prop: "rdf:type", op: "=", value: "owl:Thing",
                        }
                    })
                }
            }

        }
    } catch (e) { }

    // find common attrs

    if (current_objects.length > 1) {
        for (var id1 of [current_objects[0]]) {
            for (var attr1 of data[id1]["attrs"]) {
                if (attr1[0] == "rdf:type") continue;
                if (attr1[1] == null) continue;

                var all_have_attr1 = true;

                for (var id2 of current_objects) {
                    if (id1 == id2) continue;

                    var id2_has_attr1 = false;

                    for (var attr2 of data[id2]["attrs"]) {
                        if (same_props(attr1, attr2) && same_values(attr1, attr2)) { id2_has_attr1 = true; break; }
                    }

                    if (!id2_has_attr1) { all_have_attr1 = false; break; }
                }

                if (all_have_attr1) {
                    con_try_add(cs, poss, negs, {
                        prop: attr1[0], op: "=", value: attr1[1],
                    })
                }
            }
        }
    } else if (current_objects.length == 1) {
        for (var attr1 of data[current_objects[0]]["attrs"]) {
            if (attr1[0] == "rdf:type") continue;
            if (attr1[0] == "rdfs:label") continue;
            if (attr1[1] == null) continue;

            con_try_add(cs, poss, negs, {
                prop: attr1[0], op: "=", value: attr1[1],
            })
        }
    }

    // find common values

    if (current_objects.length > 1)
        for (var id1 of [current_objects[0]]) {
            for (var attr1 of data[id1]["attrs"]) {
                if (attr1[0] == "rdf:type") continue;

                var all_have_attr1 = true;

                for (var id2 of current_objects) {
                    if (id1 == id2) continue;

                    var id2_has_attr1 = false;

                    for (var attr2 of data[id2]["attrs"]) {
                        if (same_values(attr1, attr2)) { id2_has_attr1 = true; break; }
                    }

                    if (!id2_has_attr1) { all_have_attr1 = false; break; }
                }

                if (all_have_attr1) {
                    con_try_add(cs, poss, negs, {
                        prop: "?", op: "=", value: attr1[1],
                    })
                }
            }
        }

    if (testing) {
        var cs_start_len = cs.length;
        do {
            cs_start_len = cs.length;

            cs = rank_constrains(cs, poss, state.neg_constrains)
            cs = explore_constrains(cs, poss, state.neg_objects, state.pos_objects)

        } while (cs.length > cs_start_len);
    }

    var sorting_prop_map = {
        "rdf:type": 'aaa',
        "?": 'zzza',
        "self": 'zzzz',
    }
    cs.sort((a, b) => (sorting_prop_map[a.prop] || a.prop).localeCompare(sorting_prop_map[b.prop] || b.prop))

    state.constrains = cs;
    state.objects = constrain_query(cs.concat(poss));
}

var constrain_query_cache = {};
var constrain_query_cache_order = [];

function constrain_query(constrains, only_count) {
    if (constrains.constrains) constrains = constrains.constrains

    var constrains_sig = constrains.map(con_sig).join(' & ');
    if (constrains.length == 0) return [];

    constrain_query_cache_order.push(constrains_sig);
    constrain_query_cache_order = constrain_query_cache_order.filter((c, index) => constrain_query_cache_order.lastIndexOf(c) == index);

    if (constrains_sig in constrain_query_cache) {
        return constrain_query_cache[constrains_sig].slice();
    }

    var all = Object.keys(data);
    var l = [];
    //var l_length = 0;

    for (var id of all) {
        var valid_id = true
        for (var con of constrains) {
            var con_attr = [null, con.value, label_of(con.value)]
            var valid_con = con.op == '!=' ? true : false;

            if (con.prop == 'self') {
                if (con.op == '!=') {
                    if (con.value == id) { valid_con = false; break }
                } else {
                    console.error("self =");
                }
            } else
                if (con.prop.indexOf(Arrow) != -1) {
                    var path = con.prop.split(Arrow);

                    // TODO support != 

                    function path_check(id, path, path_index) {
                        if (path_index >= path.length) {
                            return same_values([null, id, label_of(id)], con_attr);
                        }
                        var path_prop = path[path_index];

                        if (!data[id]) return false;
                        for (var attr of data[id]["attrs"]) {
                            if (path_prop != attr[0]) continue;

                            if (path_check(attr[1], path, path_index + 1)) { valid_con = true; break }
                        }
                    }

                    path_check(id, path, 0)

                } else
                    for (var attr of data[id]["attrs"]) {
                        if (con.prop != '?' && con.prop != attr[0]) continue;

                        if (con.value == '?') { valid_con = true; break }
                        else
                            if (con.op == '=') {
                                if (same_values(con_attr, attr)) { valid_con = true; break }
                            } else if (con.op == '!=') {
                                if (same_values(con_attr, attr)) { valid_con = false; break }
                            }
                    }

            if (!valid_con) {
                valid_id = false;
                break;
            }
        }

        if (valid_id) {
            //if (!only_count) 
            l.push(id);
            //l_length += 1;
        }
    }

    constrain_query_cache[constrains_sig] = l.slice();

    //if (only_count) return {length: l_length};
    return l;
}


var getAllSubsets =
    theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ), [[]]);

function explore_constrains(constrains, poss, neg_objects, pos_objects) {
    console.time("explore_constrains")
    console.time("explore_constrains - constrain_query")

    // collect single constrain results

    var single_sets = {}
    var subs_sets = [];
    for (var i of constrains) {
        var results = constrain_query([i].concat(poss));
        single_sets[con_sig(i)] = results;

        if (results.filter(x => neg_objects.includes(x)).length == 0) {
            subs_sets.push([[i], results]);
        }
    }
    console.timeEnd("explore_constrains - constrain_query")

    if (subs_sets.length == 0) {
        // no possible subset
        for (var i of neg_objects) {
            if (con_try_add(constrains, poss, [], {
                prop: "self", op: "!=", value: i,
            })) break;
        }
        console.timeEnd("explore_constrains");
        return constrains;
    }

    // collect multiple contrain results, by intersertion of singles

    for (var i of getAllSubsets(constrains)) {
        if (i.length < 2) continue;

        var results = single_sets[con_sig(i[0])];
        for (var index = 1; index < i.length; index++) {
            results = results.filter(x => single_sets[con_sig(i[index])].includes(x));
        }

        if (results.filter(x => neg_objects.includes(x)).length == 0) {
            subs_sets.push([i, results]);
        }
    }

    // sort by results count and then constrains count 

    function sorter(a, b) { // item: [constrains_list, results_list]
        var constrains_count_d = a[0].length - b[0].length
        var results_count_d = a[1].length - b[1].length

        if (results_count_d != 0) return results_count_d;
        return constrains_count_d;
    }
    subs_sets.sort(sorter)

    // remove the same count less constrains
    uniq_subs_sets = []
    if (subs_sets.length > 0) {
        uniq_subs_sets.push(subs_sets[subs_sets.length - 1])
    }
    for (var i = subs_sets.length - 2; i > 0; i--) {
        var p = subs_sets[i + 1];
        var c = subs_sets[i];
        if (c[1].length != p[1].length) {
            uniq_subs_sets.push(c);
        }
    }
    uniq_subs_sets.reverse();

    // print
    function desc(con) {
        return `${con["prop"]} ${con["op"]} ${con["value"]}`.replace("!=", "≠")
    }
    //console.log("explore_constrains - power set");
    for (var i of subs_sets) {
        //console.log(i[1].length, i[0].map(desc).join(", ") );
    }
    console.log("explore_constrains - best");
    for (var i of uniq_subs_sets) {
        console.log(i[1].length, i[0].map(desc).join(", "));
    }

    console.timeEnd("explore_constrains");

    // #adhoc
    if (uniq_subs_sets.length > 1 && uniq_subs_sets[0][1].length == pos_objects.length) {
        console.log(constrains, uniq_subs_sets[1][0]);
        return uniq_subs_sets[1][0];
    }

    return constrains;
}

var rank_constrains_counts_cache = {}

function rank_constrains(constrains, poss, neg_constrains) {

    var counts = {}

    function sup(i, sup_prop, sup_value) {
        return {
            prop: sup_prop ? '?' : i["prop"],
            op: i["op"],
            value: sup_value ? '?' : i["value"]
        }
    }

    function count(i) {
        var sig = con_sig(i)
        if (!rank_constrains_counts_cache[sig]) {
            //rank_constrains_counts_cache[sig] = constrain_query([i].concat(poss)).length
            rank_constrains_counts_cache[sig] = constrain_query([i], true).length
        }
        return rank_constrains_counts_cache[sig]
    }

    var l = [];
    for (var i of constrains) {
        if (neg_constrains.map(con_sig).includes(con_sig(i))) continue;

        var both = count(i);
        var prop = count(sup(i, false, true));
        var value = count(sup(i, true, false));

        var rank = prop / both;
        console.log(rank, `${con_sig(i)}`, both, 'prop', prop, 'value', value);
        l.push([rank, i]);
    }
    l.sort((a, b) => { return a[0] - b[0]; })

    console.timeEnd("rank_constrains");

    // #adhoc
    var constrains_limit = 5;

    if (l.length <= constrains_limit) {
        return constrains;
    }

    var constrains = []
    while (constrains.length < constrains_limit) {
        constrains.push(l[constrains.length][1]);
    }
    return constrains;
}

function from_label(x) {
    if (x.indexOf(':') != -1) return x;
    // TODO lookup for the value
    return "dbr:" + x.replace(/ +/g, "_");
}

function constrains_to_sparql(constrains) {
    var text_pre = "";
    var text = "";

    var prefixes = {
        "foaf": "<http://xmlns.com/foaf/0.1/>",
        "dcterms": "<http://purl.org/dc/terms/>",
        "rdfs": "<http://www.w3.org/2000/01/rdf-schema#>",
        "dbp": "<http://dbpedia.org/property/>",
        "dbo": "<http://dbpedia.org/ontology/>",
        "dbr": "<http://dbpedia.org/resource/>",
    }

    text += `
SELECT ?x WHERE { 
`
    var prop_allias = {
        "dbo:company": "(dbo:company|dbo:productionCompany)",
        "self": "!=", // hacky
    };

    function prop_text(x) {
        var t = x.prop;
        if (t in prop_allias) {
            t = prop_allias[x.prop];
        }
        if (t.indexOf(Arrow) != -1) {
            t = t.split(Arrow).join("/");
        }
        return t;
    }

    function constrain_to_sparql(x, index) {
        var sub = "";
        if (x.prop == '?') {
            sub = `?x ?p${index} ${from_label(x.value)}`;
        } else {
            sub = `?x ${prop_text(x)} ${from_label(x.value)}`;
        }
        if (x.prop == 'self') {
            return `FILTER ( ${sub} )`;
        } else if (x.op == '=') {
            return sub + ' .';
        } else if (x.op == '!=') {
            return `MINUS { ${sub} . }`;
        }
        return `TODO implement ${x.op}`;
    }

    var index = 0;
    for (var i of constrains) {
        text += '  ' + constrain_to_sparql(i, index++) + '\n'
    }
    text = text.slice(0, -'\n'.length);

    text += `
}`

    for (var prefix in prefixes) {
        if (text.indexOf(prefix + ':') == -1) continue;
        text_pre += `PREFIX ${prefix}: ${prefixes[prefix]}\n`;
    }

    return text_pre + text;
}


function setup_interactives() {

    for (var i of qa(".switch[data-switch]")) {
        for (var item of i.querySelectorAll(".switch-item[data-switch]")) {
            item.onclick = (function () {
                this.parentElement.querySelector("[data-selected]").removeAttribute("data-selected");
                this.setAttribute("data-selected", true);

                q("body").setAttribute(
                    "data-" + this.parentElement.getAttribute("data-switch"),
                    this.getAttribute("data-switch"));

            }).bind(item);
            if (item.hasAttribute("data-selected")) item.onclick();
        }
    }

}
setup_interactives();

var message_shown = {}
function message_show(text, once) {
    if (once) {
        if (message_shown[text]) return false;
        message_shown[text] = true;
    }

    if (!q("#message").hidden) {
        message_close();
        setTimeout(() => message_show(text));
        return true;
    }

    q("#message .text").innerHTML = text;
    q("#message").hidden = false;
    q("#message").style.animation = ".3s message-anim";
    return true;
}
function message_close() {
    if (q("#message").hidden) return;

    q("#message").hidden = true;
    q("#message").style.animation = "";
}


function on_data_load() {
    message_close();

    if (!window.data) window.data = parse_ttl(data_text);

    q("#header").hidden = false;
    q("#page").hidden = false;

    if (sessionStorage.ec) {
        var tmp_state = JSON.parse(sessionStorage.ec);
        var x = state_is_min(tmp_state);
        var same_dataset = true;
        for (var id of tmp_state.pos_objects) {
            if (!data[id]) same_dataset = false;
        }
        if (!x && same_dataset) {
            state = tmp_state;
            state.mode = ModeSystem;
        }
    }

    normalize_data(data);
    change_mode(state.mode);
}

// if (url_params.get("data") != null) {
if (1) {
    // q("#path").innerText = "› " + datasets_names[url_params.get("data")]
    q("#path").innerText = "› movies.js"

    if (url_params.get("data") == "input") {
        eval("window.data_text = `" + url_params.get("input") + "`");
        on_data_load();

    } else {
        message_show("Loading...");

        var js = document.createElement("script");
        js.type = "text/javascript";
        // js.src = url_params.get("data");

        var url  = window.location.href;
        const route = "index.html";
        var substring = url.substring(url.indexOf(route) + route.length);
        console.log("substring", substring);
        if(substring == "" || substring === "?") {
            js.src = "datasets/movies.js";
            q("#about").hidden = true;
            q(".main-container-content").hidden = false;
        } else if (substring == "?about") {
            q("#about").hidden = false;
            q(".main-container-content").hidden = true;
        }

        
        js.onload = () => { // TODO use on_data_load
            message_close();
            
            if (!window.data) window.data = parse_ttl(data_text);

            //		console.log(JSON.stringify(Object.fromEntries(Object.entries(window.data).map(entry => {
            //			var i = entry[1];
            //			var o = {};
            //			for (var prop in i) {
            //				o[prop] = i[prop].length == 1 ? i[prop][0] : i[prop];
            //			}
            //			return [entry[0], o];
            //		})), null, '\t')); throw "Exported to js";

            q("#header").hidden = false;
            q("#page").hidden = false;

            if (sessionStorage.ec) {
                var tmp_state = JSON.parse(sessionStorage.ec);
                var x = state_is_min(tmp_state);
                var same_dataset = true;
                for (var id of tmp_state.pos_objects) {
                    if (!data[id]) same_dataset = false;
                }
                if (!x && same_dataset) {
                    state = tmp_state;
                    state.mode = ModeSystem;
                }
            }

            normalize_data(data);
            change_mode(state.mode);

        }
        document.body.appendChild(js);
    }

} else if (url_params.get("about") != null) {
    q("#path").innerText = "› about"

    q("#about").hidden = false;
    q(".main-container-content").hidden = true;

} else {
    //	q("#path").innerText = "› setup"

    q("#header").hidden = true;
    q("#page").hidden = true;
    // q("#setup").hidden = false;

}


// export
// console.log(Object.keys(data).map(i => [i, data[i].attrs]).flatMap(a => a[1].map(i => [a[0], i[0], i[1]].join(" "))).join(" .\n"))


