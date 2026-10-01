"use client"

import React, { useRef, useState } from 'react'
import { IKImage, IKUpload, IKVideo, ImageKitProvider } from 'imagekitio-next';
import config from '@/lib/config';
import Image from 'next/image';
import { useToast } from '../hooks/use-toast';
import { cn } from '@/lib/utils';

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;


const authenticator = async () => {

  try {

    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`)

    if (!response.ok) {

      const errorText = await response.text();


      throw new Error(
        `Request failed with status ${response.status} : ${errorText}`
      );
    }

    const data = await response.json();


    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }

}


interface Props {
  type: 'image' | 'video';
  accept: string;
  placeholder: string;
  folder: string;
  variant: 'dark' | 'light';
  onFileChange: (filepath: string) => void;
}


const FileUpload = ({
  type, accept, placeholder, folder, variant, onFileChange
}: Props) => {

  const ikUploadRef = useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const { toast } = useToast();
  const [progress, setprogress] = useState(0);


  const styles = {
    button: variant === "dark" ? "bg-dark-300" :
      "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  }

  const onError = (error: any) => {

    console.log(`ErrorMessage: ${error.message}`)

    toast({
      title: `${type} upload failed`,
      description: `Your ${type} could not be uploaded, please try again`,
      variant: "destructive"
    })
  }

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast({
      title: `${type} uploaded successfully`,
      description: `${res.filePath} uploaded successfully`
    });
  }


  const onValidate = (file: File) => {

    if (type === 'image') {
      if (file.size > 20 * 1024 * 1024) {
        toast(
          {
            title: "File too large",
            description: "Please upload a file that is less than 20MB in size",
            variant: "destructive",
          }
        )
        return false;
      }
    }
    else if (type === 'video') {
      if (file.size > 50 * 1024 * 1024) {
        toast(
          {
            title: "File too large",
            description: "Please upload a file that is less than 50MB in size",
            variant: "destructive",
          }
        )
        return false;
      }
    }

    return true;
  }

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >


      <IKUpload
        className='hidden'
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName='test-upload.pdf'
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setprogress(0)}
        onUploadProgress={({ loaded, total }) => {
          const present = Math.round((loaded * total) / 100);
          setprogress(present);
        }}
        accept={accept}
        folder={folder}
      />

      <button className={cn('upload-btn', styles.button)}
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}>

        <Image
          src="/icons/upload.svg"
          alt='upload icon'
          width={20}
          height={20}
          className='object-contain'
        />

        <p className={cn('text-base', styles.text)}>{placeholder}</p>

        {file && <p className={cn('text-base', styles.text)}>{file.filePath}</p>}
      </button>

      {progress > 0 && progress !== 100 && (
        <div className='w-full rounded-full bg-green-200'>
          <div className='progress' style={{ width: `${progress}%` }}>
            ${progress}%
          </div>

        </div>
      )}

      {file &&

        (type === 'image' ? <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={300}
        /> :
          type === 'video' ? (
            <IKVideo
              path={file.filePath}
              controls={true}
              className="h-90 w-full rounded-xl"
            />
          ) : null
        )
      }

    </ImageKitProvider>
  )
}

export default FileUpload;