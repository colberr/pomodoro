var CONFIG = {};
window.ipcRender.invoke("get_config", {}).then(result => {
	CONFIG = result;
});
var CURRENT_TYPE = null;
var CURRENT_GROUP = null;
var ACTIVE_COUNTDOWN = false;

/* Sets the value on the timer
 * @param {int} time The time to display in seconds 
 */
function set_timer(time) {
	let formatted = "";
	time = Math.floor(time / 1000);
	if (time >= 3600) {
		formatted = "XX:XX"
	} else {
		if (time < 0) {
			formatted = "-";
			time = -time;
			$("#timer").css("color", "red");
		} else {
			$("#timer").css("color", `${CONFIG["groups"][CURRENT_GROUP]}`);
		}
		let mins = Math.floor(time / 60).toString();
		let secs = (time % 60).toString();
		if (mins < 10) { mins = "0" + mins};
		if (secs < 10) { secs = "0" + secs};

		formatted += mins + ":" + secs
	}

	$("#timer").text(formatted);
	return formatted;
}

class Countdown {
	constructor(type, group, length) {
		this.type = type;
		this.group = group;
		this.time_started = (new Date).getTime();
		this.overrun = 0;
		this.time_added = 0;
		this.time_rem = length;
		this.pause_resumes = [];

		this.interval = null;

		this.start_pause();
	}
	set_timer() {
		return set_timer(this.time_rem);
	}
	loop() {
		const cur_time = (new Date()).getTime();
		const diff = cur_time - this.prev_time;

		this.time_rem -= diff;
		this.set_timer();

		this.prev_time = cur_time;
	}
	start_pause() {
		// Get current time
		const cur_time = (new Date()).getTime();

		// Start/ stop interval
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		} else {
			this.prev_time = cur_time;
			this.interval = setInterval(() => {
				this.loop()
			}, 100);
		}

		// Push time to array (except on initial start)
		if (this.pause_resumes.length > 0) {
			this.pause_resumes.push(cur_time);
		}
	}
}

$(document).ready(() => {
	// Set up buttons
	CONFIG["types"].forEach((type, i) => {
		let td = $("<td></td>", {
			colspan: 2
		});

		$("<button></button>", {
			text: type["name"],
			value: i,
			class: "type_button"
		}).appendTo(td)
		
		td.appendTo("#type_buttons");
	})

	$(".type_button").click(e => {
		if (ACTIVE_COUNTDOWN) {
			if (ACTIVE_COUNTDOWN.interval) {
				ACTIVE_COUNTDOWN.start_pause()
			}

			// ** log session info
			ACTIVE_COUNTDOWN = false;
		}

		const i = e.target.value;
		CURRENT_TYPE = CONFIG["types"][i];
		set_timer(CURRENT_TYPE["time"]);
	})

	// Set up group select
	Object.keys(CONFIG["groups"]).forEach(val => {
		$("<option></option>", {
			text: val,
			value: val
		}).appendTo("#group")
	});
	$("#group").change(e => {
		CURRENT_GROUP = e.target.value;
		const hex = CONFIG["groups"][CURRENT_GROUP];
		$("html").css("border", `6px solid ${hex}`);
		$("#timer").css("color", `${hex}`);
		$(".colour-match").css("filter", getFilter(hex));

		if (ACTIVE_COUNTDOWN) {
			ACTIVE_COUNTDOWN.group = CURRENT_GROUP;
		}
	})

	// Set default type
	CURRENT_TYPE = CONFIG["types"][0];
	CURRENT_GROUP = Object.keys(CONFIG["groups"])[0];

	// Set initial colour of icons
	$(".colour-match").css("filter", getFilter(CONFIG["groups"][CURRENT_GROUP]));

	$("#startpause").click(() => {
		if (ACTIVE_COUNTDOWN) {
			ACTIVE_COUNTDOWN.start_pause();
		} else {
			ACTIVE_COUNTDOWN = new Countdown(
				CURRENT_TYPE,
				CURRENT_GROUP,
				CURRENT_TYPE["time"]
			);
		}
	});

	$("#reset").click(() => {
		if (ACTIVE_COUNTDOWN) {
			if (ACTIVE_COUNTDOWN.interval) {
				ACTIVE_COUNTDOWN.start_pause()
			}

			// ** log session info
			ACTIVE_COUNTDOWN = false;
			set_timer(CURRENT_TYPE["time"]);
		}
	})
});