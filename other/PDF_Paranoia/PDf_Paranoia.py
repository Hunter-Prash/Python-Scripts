import PyPDF2
import os
#PASSWORD USED FOR ENCRYPTION IS swordfish

def encrypt_pdf(path,c):

    password=input('Enter password for encryption: ')
    with open(path,'rb') as f:
        reader_Obj=PyPDF2.PdfReader(f)
        writer_Obj=PyPDF2.PdfWriter()

        for page in reader_Obj.pages:
            writer_Obj.add_page(page)

        writer_Obj.encrypt(password)
    
        out_path = f'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\other\\PDF_Paranoia\\Encrypted Pdfs\\Dummy {c}_encrypted.pdf'
        with open(out_path, 'wb') as resultPdf:
             writer_Obj.write(resultPdf)


def decrypt_pdf(path,c):
    with open(path,'rb') as f:
        reader_Obj=PyPDF2.PdfReader(f)
        writer_Obj=PyPDF2.PdfWriter()

        if reader_Obj.is_encrypted:
            reader_Obj.decrypt('swordfish')
        
        for page in reader_Obj.pages:
            writer_Obj.add_page(page)
        
        out_path = f'C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\other\\PDF_Paranoia\\Decrypted Pdfs\\Dummy {c}_decrypted.pdf'

        with open(out_path, 'wb') as resultPdf:
             writer_Obj.write(resultPdf)


#ENCRYPTION FNC
c=0
for folder_path, folders_inside, files_inside in os.walk('C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\other\\PDF_Paranoia\\Test PDfs'):
    #print("Current folder:", folder_path)
    #print("Subfolders:", folders_inside)
    #print("Files:", files_inside)
    if 'Encrypted Pdfs' in folders_inside:
        folders_inside.remove('Encrypted Pdfs')
    
    if "Decrypted Pdfs" in folders_inside:
        folders_inside.remove('Decrypted Pdfs')

    
    for file in files_inside:
        if file.endswith('.pdf'):
            fullpath=os.path.join(folder_path,file)
            c=c+1
            encrypt_pdf(fullpath,c)



#DECRYPTION FNC
c=0
for folder_path, folders_inside, files_inside in os.walk('C:\\Users\\pctec\\OneDrive\\Desktop\\BACKEND projects\\Python Scripts\\other\\PDF_Paranoia\\Encrypted Pdfs'):

    for file in files_inside:
        fullpath=os.path.join(folder_path,file)
        c+=1
        decrypt_pdf(fullpath,c)