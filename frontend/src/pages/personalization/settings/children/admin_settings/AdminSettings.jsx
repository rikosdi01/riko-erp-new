import ContentHeader from '../../../../../components/content_header/ContentHeader';
import { useSettings } from '../../../../../context/SettingsContext';
import SettingsSection from '../../components/settings_section/SettingsSection';
import './AdminSettings.css';
import React from "react";

const AdminSettings = () => {
    const { settings, isLoading } = useSettings();

    return (
        <div>
            <ContentHeader title="Pengaturan" />
            {/* Simpanan */}
            <div className="saving-settings">
                {/* <TextSubtitle subtitle="Simpanan" /> */}
                <div className='settings-subtitle'>Simpanan:</div>

                <SettingsSection
                    title="Suku Bunga (Flat Tahunan) Simpanan"
                    value={settings.savingRate}
                    set="%"
                    settingKey="savingRate"
                />
                <SettingsSection
                    title="Suku Bunga (Flat Harian) Simpanan"
                    value={settings.savingRate / 365}
                    set="%"
                    isDisabled={true}
                />
                <SettingsSection
                    title="Minimal Simpanan"
                    value={settings.defaultSavings}
                    settingKey="defaultSavings"
                />
                <SettingsSection
                    title="Minimal Simpanan per Bulan"
                    value={settings.minimumSavings}
                    settingKey="minimumSavings"
                />
                <SettingsSection
                    title="Maksimal Simpanan per Bulan"
                    value={settings.maximumSavings}
                    set="%"
                    settingKey="maximumSavings"
                />
            </div>

            {/* Pinjaman */}
            <div className="loan-settings">
                {/* <TextSubtitle subtitle="Pinjaman" /> */}
                <div className='settings-subtitle'>Pinjaman:</div>

                {settings.loanRates ? (
                    Object.entries(settings.loanRates).map(([tenor, rate]) => (
                        <SettingsSection
                            key={tenor}
                            title={`Cicilan Tenor ${tenor} bulan - Suku Bunga`}
                            value={rate}
                            set="%"
                            settingKey={`loanRates.${tenor}`} // Key untuk setiap tenor
                        />
                    ))
                ) : (
                    <div>Data pinjaman belum tersedia</div>
                )}
            </div>
        </div>
    )
}

export default AdminSettings;