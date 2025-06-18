import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { differenceInDays, differenceInMonths, differenceInYears, addMonths, addYears, isBefore } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default class Formatting {
        static formatDateForInput = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Bulan 0-11
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    static formatTimestampToISO(timestamp) {
        if (!timestamp) return ""; // Tangani kasus null atau undefined
        const date = timestamp.toDate(); // Konversi Firestore Timestamp ke Date
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Koreksi ke waktu lokal
        return localDate.toISOString().slice(0, 16); // Format untuk input datetime-local
    };
    
    static getCurrentDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16); // Format sesuai datetime-local (YYYY-MM-DDTHH:MM)
    };

    static formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' +
            date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    static formatTime = (timestamp) => {
        if (!timestamp) return "";

        const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to JS Date
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    static formatStatus = (status) => {
        switch (status) {
            case 'Menunggu':
                return { icon: <Clock size={18} />, color: '#6B7280' }; // Abu-abu
            case 'Diproses':
                return { icon: <RefreshCw size={18} />, color: '#EAB308' }; // Kuning
            case 'Selesai':
                return { icon: <CheckCircle size={18} />, color: '#22C55E' }; // Hijau
            default:
                return { icon: <Clock size={18} />, color: '#6B7280' }; // Default abu-abu
        }
    };

    static formatInitial = (name) => {
        const words = name.split(' ');
        const initials = words
            .map(word => word.charAt(0).toUpperCase()) // Get the first letter of each word
            .slice(0, 2) // Get the first two initials
            .join(''); // Join them together
        return initials;
    };

    static formatCurrencyIDR = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
            .format(value)
            .replace(",00", "");

    static formatPeriode = (startDate) => {
        if (!startDate) return "";

        const start = new Date(startDate);
        const now = new Date();

        let daysDiff = differenceInDays(now, start);
        let monthsDiff = differenceInMonths(now, start);
        let yearsDiff = differenceInYears(now, start);

        if (daysDiff < 30) {
            return `${daysDiff} hari`;
        }

        if (yearsDiff >= 1) {
            let remainingMonths = differenceInMonths(now, addYears(start, yearsDiff));
            return remainingMonths === 0 ? `${yearsDiff} tahun` : `${yearsDiff} tahun ${remainingMonths} bulan`;
        }

        let remainingDays = differenceInDays(now, addMonths(start, monthsDiff));
        return remainingDays === 0 ? `${monthsDiff} bulan` : `${monthsDiff} bulan ${remainingDays} hari`;
    };

    static formatDays = (startDate) => {
        if (!startDate) return 0; // Jika tidak ada tanggal, kembalikan 0
        return differenceInDays(new Date(), new Date(startDate));
    };

    static formatEligibleMonth = (startDate) => {
        if (!startDate) return false;

        const workDate = new Date(startDate);
        const sixMonthsLater = addMonths(workDate, 6);
        const today = new Date();

        return isBefore(sixMonthsLater, today); // True jika sudah lebih dari 6 bulan
    };

    static formatMonth = () => {
        return new Date().toLocaleDateString('id-ID', { month: 'long' });
    };

    static formatMonthYear = ({ timeStamp } = {}) => {
        const date = timeStamp ? new Date(timeStamp) : new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    };

    static formatTotalSavingsWithBonus = (values) => {
        if (!values) return 0;

        // Ambil dan urutkan berdasarkan kunci (tahun-bulan)
        const sortedAmounts = Object.keys(values)
            .sort()
            .map(key => values[key]);

        let total = 0;

        for (let i = 0; i < sortedAmounts.length; i += 12) {
            const chunk = sortedAmounts.slice(i, i + 12); // Ambil 12 data
            let subtotal = chunk.reduce((acc, value) => acc + value, 0); // Total per 12 data

            if (chunk.length === 12) {
                subtotal *= 1.05; // Tambah 5% jika ada 12 data
            }

            total += subtotal;
        }

        return Math.round(total); // Bulatkan hasil akhir
    };


    static formatMonthlySavings = (values) => {
        const currentMonthKey = Formatting.formatMonthYear(); // Ambil tahun-bulan saat ini
        return values?.[currentMonthKey] || 0; // Ambil nilai yang sesuai atau 0 jika tidak ada
    };
    static formatDueDate = (startDateStr) => {
        if (!startDateStr) return "";

        // Jika startDate adalah Firestore Timestamp, konversi ke Date
        let startDate = startDateStr.seconds ? new Date(startDateStr.seconds * 1000) : new Date(startDateStr);

        // Pastikan tanggal valid
        if (isNaN(startDate.getTime())) {
            console.error("Invalid Date:", startDate);
            return "";
        }

        // Loop untuk menambahkan bulan hingga jatuh tempo lebih dari tanggal saat ini
        let dueDate = new Date(startDate);
        let currentDate = new Date();

        while (dueDate <= currentDate) {
            dueDate.setUTCMonth(dueDate.getUTCMonth() + 1);
        }

        // Konversi ke WIB (+7 jam)
        let wibDueDate = new Date(dueDate.getTime() + (7 * 60 * 60 * 1000));

        // Format ke 'YYYY-MM-DDTHH:MM' agar cocok dengan input datetime-local
        return wibDueDate.toISOString().slice(0, 16);
    };


    static formatTotalSavings = (userId, savings) => {
        const userTransactions = savings.filter((txn) => txn.userId === userId);
        console.log('User Transactions :', userTransactions)

        let totalDeposit = 0;
        let totalWithdrawal = 0;
        let totalInterest = 0;
        const now = new Date(); // Waktu saat ini

        userTransactions.forEach((txn) => {
            // console.log(txn);
            const amount = txn.amount;
            const transactionDate = new Date(txn.date.seconds * 1000); // Konversi Firestore Timestamp
            const daysElapsed = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24)); // Hitung selisih hari

            // Hitung bunga berdasarkan jumlah hari sejak transaksi
            const interest = (txn.interestRate / 100) * amount * daysElapsed;

            if (txn.type === "Pemasukkan") {
                totalDeposit += amount;
                totalInterest += interest;
            } else if (txn.type === "Pengeluaran") {
                totalWithdrawal += amount;
            }
        });

        return {
            totalSavings: totalDeposit - totalWithdrawal, // Total simpanan
            totalInterest: totalInterest // Total bunga
        };
    };

    static formatTotalInterestPerDay = (userId, savings, startDate = null, endDate = null) => {
        const userTransactions = savings.filter(txn => txn.userId === userId);

        if (userTransactions.length === 0) return [];

        // Tentukan batas rentang waktu
        let minDate = startDate ? new Date(startDate) : new Date(Math.min(...userTransactions.map(txn => txn.date.seconds * 1000)));
        let maxDate = endDate ? new Date(endDate) : new Date(Math.max(...userTransactions.map(txn => txn.date.seconds * 1000)));

        const dailyInterest = {};
        const now = new Date();
        let cumulativeBalance = 0; // Saldo yang bertambah berdasarkan bunga

        // Inisialisasi semua tanggal dalam rentang dengan nilai saldo 0
        let currentDate = new Date(minDate);
        while (currentDate <= maxDate) {
            const dateKey = currentDate.toLocaleDateString();
            dailyInterest[dateKey] = { bunga: 0, saldo: 0 };  // Menambahkan saldo untuk setiap tanggal
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Hitung bunga berdasarkan transaksi
        userTransactions.forEach(txn => {
            const amount = txn.amount;
            const transactionDate = new Date(txn.date.seconds * 1000);

            // Pastikan bunga dihitung mulai dari hari setelah tanggal transaksi
            let tempDate = new Date(transactionDate);
            tempDate.setDate(tempDate.getDate() + 1);  // Mulai dari hari berikutnya

            while (tempDate <= now) {
                const dateKey = tempDate.toLocaleDateString();

                // Pastikan tanggal sudah ada dalam dailyInterest
                if (!dailyInterest[dateKey]) {
                    dailyInterest[dateKey] = { bunga: 0, saldo: 0 };
                }

                const interest = (txn.interestRate / 100) * amount * 1; // Bunga per hari
                if (txn.type === "Pemasukkan") {
                    dailyInterest[dateKey].bunga += interest;
                }
                tempDate.setDate(tempDate.getDate() + 1); // Lanjutkan ke hari berikutnya
            }
        });

        // Hitung saldo kumulatif untuk setiap hari
        let previousDayBalance = 0;
        Object.keys(dailyInterest).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
            cumulativeBalance += dailyInterest[date].bunga;  // Tambahkan bunga pada saldo kumulatif
            dailyInterest[date].saldo = cumulativeBalance;    // Simpan saldo per hari
        });

        // Konversi ke array untuk grafik
        return Object.keys(dailyInterest).map(date => ({
            name: date,
            Pendapatan: dailyInterest[date].bunga.toFixed(2), // Menampilkan pendapatan per hari
            Saldo: dailyInterest[date].saldo.toFixed(2)       // Menampilkan saldo kumulatif
        }));
    };

    static formatTotalExpenditurePerDay = (userId, savings, startDate = null, endDate = null) => {
        const userTransactions = savings.filter(txn => txn.userId === userId && txn.type === "Pengeluaran");

        // Filter out "Pemasukkan" transactions to get deposits on specific dates
        const userDeposits = savings.filter(txn => txn.userId === userId && txn.type === "Pemasukkan");

        if (userTransactions.length === 0 && userDeposits.length === 0) return [];

        // Tentukan batas rentang waktu
        let minDate = startDate ? new Date(startDate) : new Date(Math.min(...userTransactions.map(txn => txn.date.seconds * 1000)));
        let maxDate = endDate ? new Date(endDate) : new Date(Math.max(...userTransactions.map(txn => txn.date.seconds * 1000)));


        const dailyExpenditure = {};
        const now = new Date();

        // Inisialisasi semua tanggal dalam rentang dengan nilai saldo 0
        let currentDate = new Date(minDate);
        while (currentDate <= maxDate) {
            const dateKey = currentDate.toLocaleDateString();
            dailyExpenditure[dateKey] = { pengeluaran: 0, saldo: 0 };  // Menambahkan saldo untuk setiap tanggal
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Hitung pengeluaran berdasarkan transaksi
        userTransactions.forEach(txn => {
            const amount = txn.amount;
            const transactionDate = new Date(txn.date.seconds * 1000);

            // Pastikan pengeluaran dihitung hanya untuk tanggal transaksi tersebut
            const dateKey = transactionDate.toLocaleDateString();

            // Pastikan tanggal sudah ada dalam dailyExpenditure
            if (!dailyExpenditure[dateKey]) {
                dailyExpenditure[dateKey] = { pengeluaran: 0, saldo: 0 };
            }

            // Menambahkan pengeluaran ke tanggal tersebut
            dailyExpenditure[dateKey].pengeluaran += amount;
        });

        // Menambahkan pemasukkan pada tanggal yang sesuai
        userDeposits.forEach(txn => {
            const amount = txn.amount;
            const depositDate = new Date(txn.date.seconds * 1000);

            const dateKey = depositDate.toLocaleDateString();

            // Pastikan tanggal sudah ada dalam dailyExpenditure
            if (!dailyExpenditure[dateKey]) {
                dailyExpenditure[dateKey] = { pengeluaran: 0, saldo: 0 };
            }

            // Menambahkan pemasukkan pada tanggal tersebut
            dailyExpenditure[dateKey].saldo += amount;
        });

        // Hitung saldo kumulatif untuk setiap hari
        let previousDayBalance = 0; // Mulai dengan saldo 0
        Object.keys(dailyExpenditure).sort((a, b) => new Date(a) - new Date(b)).forEach(date => {
            // Set saldo kumulatif berdasarkan pengeluaran hari tersebut
            previousDayBalance += dailyExpenditure[date].saldo;  // Pemasukkan menambah saldo
            previousDayBalance -= dailyExpenditure[date].pengeluaran;  // Pengeluaran mengurangi saldo
            dailyExpenditure[date].saldo = previousDayBalance;        // Simpan saldo per hari
        });

        // Konversi ke array untuk grafik
        return Object.keys(dailyExpenditure).map(date => ({
            name: date,
            Pengeluaran: dailyExpenditure[date].pengeluaran.toFixed(2), // Menampilkan pengeluaran per hari
            Saldo: dailyExpenditure[date].saldo.toFixed(2)           // Menampilkan saldo kumulatif
        }));
    };

    static formatTotalMonthlySavings = (values) => {
        return Object.values(values || {}).reduce((acc, value) => acc + value, 0);
    }

    static formatTimeStampToISO(timestamp) {
        if (!timestamp) return ""; // Tangani kasus null atau undefined
        const date = timestamp.toDate(); // Konversi Firestore Timestamp ke Date
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Koreksi ke waktu lokal
        return localDate.toISOString().slice(0, 16); // Format untuk input datetime-local
    };

    static formatToTimestampWIB = (dateString) => {
        const date = new Date(dateString); // Ubah string menjadi objek Date
        return Timestamp.fromDate(date); // Simpan langsung dalam Firebase (UTC)
    };

    static handleEntryDateChange(e, setEntryDate) {
        const localDate = new Date(e.target.value); // Ambil waktu lokal dari input
        const isoDateString = localDate.toISOString(); // Convert to UTC in ISO format
        const firestoreTimestamp = Timestamp.fromDate(new Date(isoDateString)); // Convert to Firestore Timestamp
        setEntryDate(firestoreTimestamp); // Simpan sebagai Firestore Timestamp
    };

    static isSearchMatch = (text, query) => {
        if (!text || !query) return false;

        const words = text.toLowerCase().split(/\s+/); // Pisahkan berdasarkan spasi
        const queryWords = query.toLowerCase().split(/\s+/); // Pisahkan input search berdasarkan spasi

        let wordIndex = 0;

        return queryWords.every(qw => {
            const found = words.slice(wordIndex).some((word, i) => {
                if (word.startsWith(qw)) {
                    wordIndex += i + 1; // Lompat ke indeks setelah yang cocok
                    return true;
                }
                return false;
            });
            return found;
        });
    };

}