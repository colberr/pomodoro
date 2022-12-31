var CONFIG = {};
window.ipcRender.invoke("get_config", {}).then(result => {
	CONFIG = result;
})
var CURRENT_TYPE = CONFIG["types"][0];
var ACTIVE_COUTNDOWN = false;

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
	constructor(type, group, time_started, length) {
		this.type = type;
		this.group = group;
		this.time_started = time_started;
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
	CONFIG["types"].forEach(type => {
		$("<button></button>", {
			text: type["name"],
			id: type["id"],
			value: type["time"],
			class: "type_button"
		}).appendTo("#type_buttons");
	})

	$("#startpause").click(() => {
		if (ACTIVE_COUTNDOWN) {
			ACTIVE_COUTNDOWN.start_pause();
		} else {
			ACTIVE_COUTNDOWN = new Countdown(
				CURRENT_TYPE,
				$("#group").val(),
				(new Date).getTime(),
				30 * 1000
			);
		}
	});

	// $("#sbreak").click(() => {
	// 	set_timer(CONFIG["types"][2]["time"]);
	// })
});