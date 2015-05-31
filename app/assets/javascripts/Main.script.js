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
    var spectrum_points = [],// [канал, отсчеты]
        buf,    //буфер для вычислений
        buf_m = [], //буфер для хранения последних значений отсчётов
        peak_channel = 0, //канал пика
        x_max = 1000, 
        x_min = 0,
        y_max = 5000,
        y_min = 0,//стандартоное значение параметров
        last_checked_radio = 9696, //последний выбраный изотоп
        checked_radio, //выбранный изотоп в этом цикле измерений
        full_time = 0, //полное время измерения
        time = 1000, //время в текущем выборе измеренй
        plot,
        a = [],
        updateInterval = 50; //интервал обновления, мс

    var data = []; //массив для динамического обновления
    var placeholder = $("#placeholder");

    array_set_zero(buf_m);

    $("#build").click(function () {
        var second_channel_of_photopeak = 0;
        $("#answer").val("Ваш ответ");
        spectrum_points.length = 0;
        x_min = $("#x_min").val();
        x_max = $("#x_max").val();
        y_min = $("#y_min").val();
        y_max = $("#y_max").val();
        time = $("#time").val(); //снимаем параметры

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
        //валидация параметров
        var options = {
            series: {
                points: {show: true},
                shadowSize: 0
            },
            crosshair: {mode: "x"},
            grid: {
                hoverable: true,
                autoHighlight: true
            },
            yaxis: {
                min: -200,
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
        };//параметры графика
        checked_radio = $('input[name="raz"]:checked').val(); //какой номер выбран
        if (checked_radio != last_checked_radio) {
            //если изменился изотоп, то зануляем параметры и пересчитываем аппаратную функцию
            second_channel_of_photopeak = 0;
            array_set_zero(buf_m);
            last_checked_radio = checked_radio;
            peak_channel = energy_to_channel(parseInt(checked_radio));
            spectrum_points.length = 0;
            full_time = 0;

            //аппаратная функция спектрометра
            a[1] = 1.38 * peak_channel + 4106;
            a[2] = 0.0004 * peak_channel + 0.279;
            a[3] = 0.9789 * peak_channel - 432;
            a[4] = 0.032 * peak_channel + 21.44;
            a[5] = 10000;
            a[6] = peak_channel;
            a[7] = 3;
            a[12] = 0;
            a[52] = 0;
        } //проверка обновления источника
        //если это изотоп с двойным пиком- добавляем точек
        if (checked_radio == 5) {
            second_channel_of_photopeak = energy_to_channel_double_peak(parseInt(checked_radio));
            a[12] = 1.38 * second_channel_of_photopeak + 4106;
            a[22] = 0.0004 * second_channel_of_photopeak + 0.279;
            a[32] = 0.9789 * second_channel_of_photopeak - 432;
            a[42] = 0.032 * second_channel_of_photopeak + 21.44;
            a[52] = 10000;
            a[62] = second_channel_of_photopeak;
            a[72] = 1;
        } //двойной распад

        for (var i = 0; i < 5000; i+= 3) {
            buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7], 500);
            if (second_channel_of_photopeak != 0) { //если это не 5 источник- добавляем ещё             один пик
                buf += calc(i, a[12], a[22], a[32], a[42], a[52], a[62], a[72], 500);
            }

            buf = buf_m[i] + buf;
            /*+Puas(buf); // добавляем пуассона*/
            buf_m[i] = buf; //запомониаем у
            spectrum_points.push([i, buf]);
        } //вычисление 1ого шага
        plot = $.plot(placeholder, [
            {data: spectrum_points, label: "spectr(x) = -0.00"},
        ],options); //рисуем первый шаг


        array_set_zero(data);
        function getSpectrumData() { //получаем значения спектра
            var res = [];
            for (var i = 0; i < 5000; i+= 3) {
                buf = calc(i, a[1], a[2], a[3], a[4], a[5], a[6], a[7], 20);//посчитали шаг
                buf = buf + Puas(buf);  //зашумили шаг
                buf_m[i] = buf_m[i] + buf;  //к старому спектру добавили текущий шаг
                buf = buf_m[i];
                res.push([i, buf]);
            }
            return res;

        } //обновление точек спектра
        var t = 0; //зануляем время текущего цикла
        function update() { //обновление графика

            if (t < time-100) {
                t += 100;
                full_time += 100;
                $("#full-time").text(full_time+" cек");
                plot = $.plot(placeholder, [
                    {data: getSpectrumData(), label: "spectr(x) = -0.00"},
                ], options);

                setTimeout(update, updateInterval);

            }
        }
        update();

        t = 0;



        placeholder.bind("plotunselected", function (event) {
            $("#selection").text("");
        });
        placeholder.bind("plotselected", function (event, ranges) {

            $("#selection").text(ranges.xaxis.from.toFixed(1) + " to " + ranges.xaxis.to.toFixed(1));

            var zoom = $("#squaredTwo").prop("checked");

            if (zoom) {
                $.each(plot.getXAxes(), function (_, axis) {
                    var opts = axis.options;
                    opts.min = ranges.xaxis.from;
                    opts.max = ranges.xaxis.to;
                });
                plot.setupGrid();
                plot.draw();
                plot.clearSelection();
                legends.eq(i).text(series.label.replace(/spectr(.*)=.*/, "spectr(" +pos.x.toFixed(0)
                +") = "+ y.toFixed(0)));

            }
        });
        ////////////////////
        placeholder.bind("plothover", function (event, pos, item) {
            latestPosition = pos;
            if (!updateLegendTimeout) {
                updateLegendTimeout = setTimeout(updateLegend, 50);
            }
        });
        $("#answer-field").slideDown();
        $("#warning-text").slideUp(); //окошки для ответов

        //flot www.flotcharts.org/flot/examples/tracking/index.html
        var legends = $("#placeholder .legendLabel");

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


                legends.eq(i).text(series.label.replace(/spectr(.*)=.*/, "spectr(" + pos.x.toFixed(0)
                + ") = " + y.toFixed(0))); //заменяем поле информации канал(спектр)
            }
        }


    });



    $("#clear").click(function () { //кнопка сброс
        $("#answer-field").slideUp();
        $("#warning-text").slideUp();//прячем поля для ответов
        full_time = 0;
        $("#full-time").text('0 сек'); //убираем время измерений
        options = {
            series: {
                lines: {show: false}
            }

        }; //убираем график
        spectrum_points.length = 0; //зануляем массив с точками
        array_set_zero(buf_m); //зануляем буффер с последними точками

        plot = $.plot(placeholder, [
            {data: spectrum_points, label: "spectr(x) = -0.00"},
        ], options); //отрисовываем график

    });



    $("#check").click(function () { // первая задача, проверка неизвестного источника
        var answer = $("#answer").val();

        var right_answer = calibration() * peak_channel;
        if ((answer > (right_answer - right_answer * 0.1)) && (answer < (right_answer + right_answer * 0.1))) {
            alert("верно");
        }
        else {
            alert("неверно");
        }
    });

});