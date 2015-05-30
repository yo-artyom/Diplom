/**
/**
 * Created by Artem Malyshev on 22.03.15.
 */

$(function() {
    if (typeof $.fn.prop != 'function') {
        $.fn.prop = $.fn.attr;
    }
    $("#answer-field").hide();
    $("#warning-text").hide();
    var spectrum_points = [],
        buf, buf_m = [],
        a = [],
        peak_channel = 0,
        x_max = 1000,
        x_min= 0,
        y_max = 5000,
        y_min = 0,
        last_checked_radio = 9696,
        checked_radio ,
        time=1000,
        plot,
        energy_1;


    var placeholder = $("#placeholder");
    var energy_on_channel= calibration();
    buf_m_set_zero(buf_m);

    $("#build").click(function () {
        $("#answer").val("Ваш ответ");
        spectrum_points.length = 0;
        x_min=$("#x_min").val();
        x_max=$("#x_max").val();
        y_min=$("#y_min").val();
        y_max=$("#y_max").val();
        time=$("#time").val();

        if (x_min > x_max) {
            return false;
        }
        if (x_max > 5000) {
            x_max = 5000;
        }
        if (x_min < 0) {
            x_min = 0;
            $("#x_min").val(0);
            }
        var options = {
            series: {
                points: {show: true},
                shadowSize: 0
            },
            /*crosshair: {mode: "x"},*/
            /*grid: {
                hoverable: true,
                autoHighlight: true
            },*/
            yaxis: {
                min: y_min,
                max: y_max
            },
            xaxis: {
                min: x_min,
                max: x_max
            },
            selection: {
                mode: "x"
            },
            colors: ["#FF7070"]
        };
        checked_radio=$('input[name="raz"]:checked').val();
        if (checked_radio != last_checked_radio) {
            energy_1 = 0;
            buf_m_set_zero(buf_m);
            last_checked_radio = checked_radio;
            peak_channel = number_to_energy(parseInt(checked_radio));
            spectrum_points.length = 0;
            a[1] = -1.38 * peak_channel + 4106;
            a[2] = 0.0004 * peak_channel + 0.279;
            a[3] = 0.9789 * peak_channel - 432;
            a[4] = 0.032 * peak_channel + 21.44;
            a[5] = 10000;
            a[6] = peak_channel;
            a[7] = 3;
            a[12]= 0;
            a[52]= 0;
        }

        if (checked_radio == 5){
            energy_1 = number_to_energy_double_peak(parseInt(checked_radio));
            a[12] = -1.38 * energy_1 + 4106;
            a[22] = 0.0004 * energy_1 + 0.279;
            a[32] = 0.9789 * energy_1 - 432;
            a[42] = 0.032 * energy_1 + 21.44;
            a[52] = 10000;
            a[62] = energy_1;
            a[72] = 1;
        }

        for (var i = 0; i < 5000; i++) {
            buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7],500);
            if (energy_1 != 0){ //если это не 5 источник- добавляем ещё один пик
                buf +=  calc(i, a[12], a[22], a[32], a[42], a[52], a[62], a[72],500);
            }

            buf=buf_m[i]+buf;/*+Puas(buf); // добавляем пуассона*/
            buf_m[i]=buf; //запомониаем у
            spectrum_points.push([i, buf]);
        } //вычисление 1ого шага
        plot = $.plot(placeholder, [
            {data: spectrum_points/*, label: "spectr(x) = -0.00"*/},
        ], options); //рисуем первый шаг

        var updateInterval = 50; //интервал обновления, мс
        var data = [];
        buf_m_set_zero(data);
        function getRandomData() {
            var res = [];

            for (var i = 0; i < 5000; i++) {
                buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7],500);
                buf = buf + Puas(buf);
                data[i]=data[i]+buf;
                buf = data[i];
                res.push([i, buf]);
            }
            return res;

        }

        var t = 0;
        function update() {
            /*if (t <= time){
                t +=200;
            */
            plot = $.plot(placeholder, [
                {data: getRandomData(), label: "spectr(x) = -0.00"},
            ], options);

            setTimeout(update, updateInterval);
         /*   }
            else{return false}*/
        }

        update();

        //////////////////////////////////////////////////*/*
        // */
        /*var legends = $("#placeholder .legendLabel");

        legends.each(function () {
            // fix the widths so they don't jump around
            $(this).css('width', $(this).width());
        });

        var updateLegendTimeout = null;
        var latestPosition = null;

        function updateLegend() {

            updateLegendTimeout = null;
            var pos = latestPosition;
            var axes = plot.getAxes();

            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                return;
            }

            var i, j, dataset = plot.getData();
            for (i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                // Find the nearest points, x-wise

                for (j = 0; j < series.data.length; ++j) {
                    if (series.data[j][0] > pos.x) {
                        break;
                    }
                }

                // Now Interpolate

                var y,
                    p1 = series.data[j - 1],
                    p2 = series.data[j];

                if (p1 == null) {
                    y = p2[1];
                } else if (p2 == null) {
                    y = p1[1];
                } else {
                    y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                }


                legends.eq(i).text(series.label.replace(/spectr(.*)=.*/ /* !, "spectr(" +pos.x.toFixed(0)
                +") = "+ y.toFixed(0)));
            }
        }
        ////////////////////масштабирование

        placeholder.bind("plotunselected", function (event) {
            $("#selection").text("");
        });
        placeholder.bind("plotselected", function (event, ranges) {

            $("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));

            var zoom = $("#squaredTwo").prop("checked");

            if (zoom) {
                $.each(plot.getXAxes(), function(_, axis) {
                    var opts = axis.options;
                    opts.min = ranges.xaxis.from;
                    opts.max = ranges.xaxis.to;
                });
                plot.setupGrid();
                plot.draw();
                plot.clearSelection();
                legends.eq(i).text(series.label.replace(/spectr(.*)=.*/ /*, "spectr(" +pos.x.toFixed(0)
                +") = "+ y.toFixed(0)));



            }
        });
        ////////////////////
        placeholder.bind("plothover",  function (event, pos, item) {
            latestPosition = pos;
            if (!updateLegendTimeout) {
                updateLegendTimeout = setTimeout(updateLegend, 50);
            }
        });
        //показываем окно для ввода ответа
        $("#answer-field").slideDown();
        $("#warning-text").slideUp();
        if (checked_radio == 5 )
            $("#warning-text").slideDown();
    });

    $("#clear").click(function() {
        $("#answer-field").slideUp();
        $("#warning-text").slideUp();
        options = {
            series: {
                lines: {show: false}
            }

        };
        spectrum_points.length = 0;
        for (var i = x_min; i < x_max; i++) {buf_m[i] = 0}
        spectrum_points = [0,0];
        plot = $.plot(placeholder, [
            {data: spectrum_points, label: "spectr(x) = -0.00"},
        ], options);
    });
    $("#check").click(function(){

        var answer = $("#answer").val();
        var right_answer = energy_on_channel * peak_channel;
        if ((answer > (right_answer-right_answer*0.1)) && (answer < (right_answer+right_answer*0.1))) {
            alert ("верно");
        }
        else {
            alert ("неверно");
        }
    });

    $("#test").click(function(){

        $("#text-field").val(answer);
    */});
});