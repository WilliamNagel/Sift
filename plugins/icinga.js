var colors = require('colors')
var unirest = require('unirest')
var icinga = module.exports = {
	filter: function(config, callback) {
		var filters = []
		if (config.icinga_user == null || config.icinga_pass == null) {
			console.log('Please define icinga_user & icinga_pass in the config'.red);
			return callback([{ name: 'name', value: '___ERROR___' }])
		}

		unirest.get('http://watchdog.internal.mojang/cgi-bin/icinga/status.cgi?host=all&type=detail&servicestatustypes=16&hoststatustypes=3&serviceprops=2097162&nostatusheader&jsonoutput').auth({
			user: config.icinga_user,
			pass: config.icinga_pass,
			sendImmediately: true
		}).as.json(function (response) {
			try {
				response.body = JSON.parse(response.body)
			} catch (e) {
				return console.log('Couldn\'t parse icinga json')
			}
			if (response.body.status == null || response.body.status.service_status == null) {} else {
				for(var service_status in response.body.status.service_status) {
					var item = response.body.status.service_status[service_status];
					filters.push({ name: 'hostname', value: item.host_name })
				}
			}

			if (response.body.status == null || response.body.status.host_status == null) {} else {
				for(var host_status in response.body.status.host_status) {
					var item = response.body.status.host_status[host_status];
					filters.push({ name: 'hostname', value: item.host_name })
				}
			}
			if (filters.length == 0) {
				console.log('No hosts are down, ignoring icinga filter'.red)
			}
			callback(filters)
		})
	}
}