import React, { useEffect, useState } from "react";
import { useToast } from "../../../../../../../../context/ToastContext";
import RolesRepository from "../../../../../../../../repository/authentication/RolesRepository";
import "./RoleSettingsModal.css";

const RoleSettingsModal = ({ isOpen, onClose, roles }) => {
  const { showToast } = useToast();
  const [editedRoles, setEditedRoles] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null); // role name to delete

  useEffect(() => {
    if (isOpen) {
      setEditedRoles(roles.map(role => ({ name: role, original: role })));
    }
  }, [isOpen, roles]);

  const handleRename = async (index, newName) => {
    const { original } = editedRoles[index];

    if (!newName.trim()) {
      showToast("gagal", "Nama tidak boleh kosong");
      return;
    }

    try {
      await RolesRepository.renameRole(original, newName);
      showToast("berhasil", `Role diubah menjadi "${newName}"`);
    } catch (e) {
      showToast("gagal", "Gagal mengganti nama role");
      console.error(e);
    }
  };

  const confirmDeleteRole = async () => {
    if (!confirmDelete) return;
    try {
      await RolesRepository.deleteRole(confirmDelete);
      showToast("berhasil", `Role "${confirmDelete}" dihapus`);
      setConfirmDelete(null);
    } catch (e) {
      showToast("gagal", "Gagal menghapus role");
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="role-modal-overlay">
      <div className="role-modal-content">
        <h2 className="role-modal-title">Kelola Role</h2>
        <div className="role-list">
          {editedRoles.map((role, idx) => (
            <div key={role.original} className="role-item">
              <input
                value={role.name}
                onChange={(e) => {
                  const updated = [...editedRoles];
                  updated[idx].name = e.target.value;
                  setEditedRoles(updated);
                }}
                className="role-input"
              />
              <button className="role-action blue" onClick={() => handleRename(idx, role.name)}>
                Simpan
              </button>
              <button className="role-action red" onClick={() => setConfirmDelete(role.original)}>
                Hapus
              </button>
            </div>
          ))}
        </div>
        <div className="role-modal-footer">
          <button className="close-button" onClick={onClose}>Tutup</button>
        </div>
      </div>

      {/* Modal konfirmasi hapus */}
      {confirmDelete && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <p>Yakin ingin menghapus role <strong>"{confirmDelete}"</strong>?</p>
            <div className="confirm-modal-actions">
              <button className="confirm-button danger" onClick={confirmDeleteRole}>Ya, Hapus</button>
              <button className="confirm-button" onClick={() => setConfirmDelete(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSettingsModal;