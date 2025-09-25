import _ from "lodash";
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useAuth } from "../../contexts/authContext";
import styles from "./styles.module.scss";

function QrcodeRead({ setDataLogin }) {
  const [data, setData] = useState("No result");
  const { login } = useAuth();

  return (
    <div className={styles.qrCodeReader}>
      <QrReader
        constraints={{facingMode: 'user'}}
        onResult={(result, error) => {
          if (!_.isNil(result)) {
            const newResult = result.text.split("&&");
            const data = {
              username: newResult[0],
              password: newResult[1],
              isQrCode: true
            }
            setData(data);
            setDataLogin(data);
            login(data.username, data.password);

          }
          if (!!error) {
            console.info(error);
          }
        }}    
      />
      <p>{data.username}</p>
    </div>
  );
} export default QrcodeRead;