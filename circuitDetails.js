// ViewModel KnockOut
var vm = function () {
    console.log('ViewModel initiated...');
    //---Variáveis locais
    var self = this;
    self.baseUri = ko.observable('http://192.168.160.58/Formula1/api/Circuits/Circuit?id=');
    self.displayName = 'Circuit Details';
    self.error = ko.observable('');
    self.passingMessage = ko.observable('');
    //--- Data Record
    self.CircuitId = ko.observable('');
    self.CircuitRef = ko.observable('');
    self.ImageUrl = ko.observable('');
    self.Name = ko.observable('');
    self.Country = ko.observable('');
    self.Races = ko.observableArray('');
    self.Location = ko.observable('');
    self.Lat = ko.observable('');
    self.Lng = ko.observable('');
    self.Alt = ko.observable('');
    self.Url = ko.observable('');
    self.firstHeld = ko.observable('');

    //--- Page Events
    self.activate = function (id) {
        console.log('CALL: getCircuit...');
        var composedUri = self.baseUri() + id;
        ajaxHelper(composedUri, 'GET').done(function (data) {
            console.log(data);
            self.CircuitId(data.CircuitId);
            self.CircuitRef(data.CircuitRef);
            self.ImageUrl(data.ImageUrl);
            self.Name(data.Name);
            self.Country(data.Country);
            self.Races(data.Races);
            self.Location(data.Location);
            self.Lat(data.Lat);
            self.Lng(data.Lng);
            self.Alt(data.Alt);
            self.Url(data.Url);
            self.firstHeld(data.Races[0].Year);
            hideLoading();
        });
    };
    //--- Internal functions
    function ajaxHelper(uri, method, data) {
        self.error(''); // Clear error message
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });

    }
    function showLoading() {
        $('#myModal').modal('show',{
            backdrop: 'static',
            keyboard: false
        });
    }
    function hideLoading() {
        $('#myModal').on('shown.bs.modal', function (e) {
            $("#myModal").modal('hide');
        })
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    //--- start ....
    showLoading();
    var pg = getUrlParameter('id');
    console.log(pg);
    if (pg == undefined)
        self.activate(1);
    else {
        self.activate(pg);
    }
};

$(document).ready(function () {
    console.log("ready!");
    ko.applyBindings(new vm());
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    };
    var pg = getUrlParameter('id');
    console.log(pg);
    function ajaxHelper(uri, method, data) {
        return $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            data: data ? JSON.stringify(data) : null,
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("AJAX Call[" + uri + "] Fail...");
                hideLoading();
                self.error(errorThrown);
            }
        });

    }
    var urlCall = 'http://192.168.160.58/Formula1/api/Circuits/Circuit?id=' + pg;
    ajaxHelper(urlCall, 'GET').done(function (data) {
        console.log(data)
        var map = L.map('map').setView([data.Lat, data.Lng], 13);
        var marker = L.marker([data.Lat, data.Lng]).addTo(map).bindPopup('<b>' + data.Name + ' </b><br />' + data.Location + ', ' + data.Country)
        var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
	    }).addTo(map);
    })

});
