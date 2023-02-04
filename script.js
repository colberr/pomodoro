var CONFIG = {};
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
		this.length = length;
		this.time_rem = length;
		this.overrun = 0;
		this.time_added = 0;
		this.pause_resumes = [];

		this.interval = null;

		$("#slider").prop("max", Math.round(length / 1000));
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

		if (!$("#slider").is(":active")) {
			$("#slider").val(Math.round((this.length - this.time_rem) / 1000));
		}
	}
	start_pause() {
		// Get current time
		const cur_time = (new Date()).getTime();

		// Start/ stop interval
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
			$("#startpause").css("background-image", "url('img/play.png')");
		} else {
			this.prev_time = cur_time;
			this.interval = setInterval(() => {
				this.loop()
			}, 100);
			$("#startpause").css("background-image", "url('img/pause.png')");
		}

		// Push time to array (except on initial start)
		if (this.pause_resumes.length > 0) {
			this.pause_resumes.push(cur_time);
		}
	}
}

$(document).ready(async () => {
	// Read config file
	CONFIG = await window.ipcRender.invoke("get_config", {});

	// Set defaults
	CURRENT_TYPE = CONFIG["types"][0];
	CURRENT_GROUP = Object.keys(CONFIG["groups"])[0];

	// Set up type buttons
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

	// Set up group select & class to colour slider circle
	var thumb_classes = "";
	for (const [name, col] of Object.entries(CONFIG["groups"])) {
		$("<option></option>", {
			text: name,
			value: name
		}).appendTo("#group");
		
		thumb_classes += `#slider.${name}::-webkit-slider-thumb {background: ${col}} `;
	}
	$("<style>" + thumb_classes + "</style>").appendTo("head");
	$("#slider").addClass(CURRENT_GROUP);

	$("#group").change(e => {
		$("#slider").removeClass(CURRENT_GROUP);
		CURRENT_GROUP = e.target.value;

		const hex = CONFIG["groups"][CURRENT_GROUP];
		$("html").css("border", `6px solid ${hex}`);
		$("#timer").css("color", `${hex}`);
		$(".colour-match").css("filter", getFilter(hex));
		$("#slider").addClass(CURRENT_GROUP);

		if (ACTIVE_COUNTDOWN) {
			ACTIVE_COUNTDOWN.group = CURRENT_GROUP;
		}
	})

	// Set initial colour of icons
	$(".colour-match").css("filter", getFilter(CONFIG["groups"][CURRENT_GROUP]));

	// Start/ pause button
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

	// Reset button
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