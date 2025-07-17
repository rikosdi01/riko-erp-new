import { useEffect, useState } from 'react';
import './FormatSettings.css';
import ContentHeader from '../../../../../components/content_header/ContentHeader';
import FormatSettingsField from './components/format_settings_field/FormatSettingsField';
import FormatSettingsSelect from './components/format_settings_select/FormatSettingsSelect';
import PersonalRepository from '../../../../../repository/personalization/FormatRepository';
import { useToast } from '../../../../../context/ToastContext';
import { useFormats } from '../../../../../context/personalization/FormatContext';

const FormatSettings = () => {
    const { showToast } = useToast();
    const { formats } = useFormats();

    const [yearFormat, setYearFormat] = useState(formats.yearFormat || 'twoletter');
    const [monthFormat, setMonthFormat] = useState(formats.monthFormat || 'number');
    const [uniqueFormat, setUniqueFormat] = useState(formats.uniqueFormat || 'number');
    const [presets, setPresets] = useState(formats.presets || {});

    console.log('Formats: ', formats);
    useEffect(() => {
    console.log('Formats - 16: ', formats);
        if (formats) {
            setYearFormat(formats.yearFormat || 'twoletter');
            setMonthFormat(formats.monthFormat || 'number');
            setUniqueFormat(formats.uniqueFormat || 'number');
            setPresets(formats.presets || {});
        }
    }, [formats]);

    useEffect(() => {
        console.log('Presets: ', presets);
        console.log('Presets: ', presets.sales);
        console.log('Presets: ', presets.adjustments);
    }, [presets])


    const [year, setYear] = useState(2025);
    const [month, setMonth] = useState(1);
    const [unique, setUnique] = useState(1);


    const yearOptions = [
        { value: 'twoletter', label: 'Angka (2)' },
        { value: 'fourletter', label: 'Angka (4)' },
    ]

    const monthOptions = [
        { value: 'number', label: 'Angka (1)' },
        { value: 'letter', label: 'Huruf (A)' },
    ]

    const uniqueOptions = [
        { value: 'number', label: 'Angka (001)' },
        { value: 'roman', label: 'Romawi (I)' },
    ]

    const updatePrefix = (key, newPrefix) => {
        setPresets(prev => ({ ...prev, [key]: newPrefix }));
    };

    useEffect(() => {
        console.log('Year Format: ', yearFormat)
    }, [yearFormat]);

    const handleCreateFormat = async () => {
        try {
            const formatData = {
                yearFormat,
                monthFormat,
                uniqueFormat,
                presets,
            }

            console.log(formatData);

            await PersonalRepository.createFormatSettings("formatDefault", formatData);
            showToast('berhasil', 'Format Kode berhasil disimpan');
        } catch (error) {
            console.error("Gagal simpan format:", error);
            showToast('gagal', 'Format Kode gagal disimpan');
        }
    };

    if (!formats) {
        return <div>Loading format data...</div>;
    }

    return (
        <div className="main-container">
            <div className="manage-account-container">
                <ContentHeader title={"Format"} />
                <button className='format-settings-button' onClick={handleCreateFormat}>Simpan Pembaruan</button>
                <div className='settings-format'>
                    <div className='settings-format-subtitle'>Format Kode</div>
                    <FormatSettingsSelect
                        title={'Format Tahun'}
                        options={yearOptions}
                        valueFormat={yearFormat}
                        setValueFormat={setYearFormat}
                        value={year}
                        setValue={setYear}
                    />

                    <FormatSettingsSelect
                        title={'Format Bulan'}
                        options={monthOptions}
                        valueFormat={monthFormat}
                        setValueFormat={setMonthFormat}
                        min={1}
                        max={12}
                        value={month}
                        setValue={setMonth}
                    />

                    <FormatSettingsSelect
                        title={'Format Unik'}
                        options={uniqueOptions}
                        valueFormat={uniqueFormat}
                        setValueFormat={setUniqueFormat}
                        min={1}
                        value={unique}
                        setValue={setUnique}
                    />

                    <div className='divider' style={{ marginTop: '20px' }}></div>

                    {/* Field */}
                    <div className='settings-format-sub-header-container'>
                        <div className='settings-format-sub-header'>
                            - Penjualan
                        </div>
                        <FormatSettingsField
                            defaultValue={presets.sales}
                            title={'Pesanan'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("sales", val)}
                        />

                        <FormatSettingsField
                            defaultValue={presets.returns}
                            title={'Returan Pesanan'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("returns", val)}
                        />
                    </div>


                    <div className='settings-format-sub-header-container'>
                        <div className='settings-format-sub-header'>
                            - Inventaris
                        </div>
                        <FormatSettingsField
                            defaultValue={presets.warehouse}
                            title={'Penyimpanan Stok'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("warehouse", val)}
                        />

                        <FormatSettingsField
                            defaultValue={presets.adjustments}
                            title={'Penyesuaian Stok'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("adjustments", val)}
                        />

                        <FormatSettingsField
                            defaultValue={presets.transfers}
                            title={'Pemindahan Stok'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("transfers", val)}
                        />
                    </div>

                    <div className='settings-format-sub-header-container'>
                        <div className='settings-format-sub-header'>
                            - Logistik
                        </div>
                        <FormatSettingsField
                            defaultValue={presets.delivery}
                            title={'Pengiriman Pesanan'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("delivery", val)}
                        />

                        <FormatSettingsField
                            defaultValue={presets.invoice}
                            title={'Faktur Pesanan'}
                            year={year}
                            month={month}
                            unique={unique}
                            yearFormat={yearFormat}
                            monthFormat={monthFormat}
                            uniqueFormat={uniqueFormat}
                            onChange={(val) => updatePrefix("invoice", val)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormatSettings;

// const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');

// const handleDateFormatChange = (value) => {
//     const isValid = /^[dmy/-]+$/i.test(value);
//     if (isValid) setDateFormat(value);
// };

// const formatToday = (format) => {
//     const today = new Date();

//     const dd = String(today.getDate()).padStart(2, '0');
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const yy = String(today.getFullYear()).slice(-2);
//     const yyyy = String(today.getFullYear());

//     const monthNames = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     const MMM = monthNames[today.getMonth()].slice(0, 3); // Jul
//     const MMMM = monthNames[today.getMonth()]; // July

//     return format
//         .replace(/yyyy/i, yyyy)
//         .replace(/mmmm/i, MMMM)
//         .replace(/mmm/i, MMM)
//         .replace(/mm/i, mm)
//         .replace(/dd/i, dd)
//         .replace(/yy/i, yy);
// };


{/* <div className='settings-format'>
                    <div className='settings-format-subtitle'>Format Tanggal dan Waktu</div>

                    <FormatSettingsDateTime />
                    <FormatSettingsDateTime />

                    <div className="settings-format-field">
                        <label>Format Waktu</label>

                        <div className='settings-format-ex'>
                            <div className='settings-format-code'>
                                <input
                                    className='settings-input'
                                    type="text"
                                    placeholder="Contoh: dd/mm/yyyy"
                                    value={dateFormat}
                                    onChange={(e) => handleDateFormatChange(e.target.value)}
                                />
                            </div>

                            <div className="settings-format-field-preview">
                                <div>Contoh Kode:</div>
                                <div>{formatToday(dateFormat)}</div>
                            </div>
                        </div>
                    </div>
                </div> */}