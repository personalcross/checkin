document.addEventListener("DOMContentLoaded", () => {

    const checkinForm =
        document.getElementById("checkin-form");

    const customerIdentifier =
        document.getElementById("customer-identifier");

    const errorMessage =
        checkinForm.querySelector(".error");

    const submitButton =
        checkinForm.querySelector("button[type='submit']");


    function showMessage(message, type = "error") {

        errorMessage.textContent = message;

        errorMessage.classList.remove(
            "red-text",
            "green-text"
        );

        errorMessage.classList.add(
            type === "success"
                ? "green-text"
                : "red-text"
        );

    }


    checkinForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        showMessage("");

        const customerId =
            Number(customerIdentifier.value);

        if (
            !customerIdentifier.value.trim() ||
            !Number.isInteger(customerId) ||
            customerId <= 0
        ) {

            showMessage(
                "Introduza um número de cliente válido."
            );

            return;
        }


        try {

            submitButton.disabled = true;

            const snapshot = await db
                .collection("customers")
                .where("customerId", "==", customerId)
                .limit(1)
                .get();


            if (snapshot.empty) {

                showMessage(
                    "Cliente não encontrado."
                );

                return;
            }


            const customerDocument =
                snapshot.docs[0];

            const customer =
                customerDocument.data();


            if (customer.active !== true) {

                showMessage(
                    "Este cliente está inativo."
                );

                return;
            }


            if (customer.checkIn === true) {

                showMessage(
                    "Este cliente já realizou o check-in.",
                    "success"
                );

                return;
            }


            await customerDocument.ref.update({
                checkIn: true,
                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()
            });


            showMessage(
                `Check-in do cliente ${customerId} realizado com sucesso.`,
                "success"
            );

            checkinForm.reset();

            M.updateTextFields();


        } catch (error) {

            console.error(
                "Erro ao realizar check-in:",
                error
            );

            showMessage(
                "Não foi possível realizar o check-in."
            );

        } finally {

            submitButton.disabled = false;

        }

    });

});