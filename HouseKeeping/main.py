from circle.web3 import configurations
from pathlib import Path
import os

from circle.web3 import utils
from circle.web3 import developer_controlled_wallets


# Generate a new entity secret
# entity_secret = utils.generate_entity_secret()

# Write the entity secret to a file
# Add it also to the house_keeping.txt file
# Add it to app.config.ts file


CIRCLE_API_KEY = (
    ""
)


# ENTITY_SECRET = ""


client = utils.init_configurations_client(
    api_key=CIRCLE_API_KEY,
)


api_instance = utils.configurations.DeveloperAccountApi(client)

"""

cipher_text_response = utils.generate_entity_secret_ciphertext(
    CIRCLE_API_KEY, ENTITY_SECRET
)
# print("Entity Secret Ciphertext: ", cipher_text_response)

open("./house_keeping.txt", "a").write(
    f"ENTITY_SECRET_CIPHER_TEXT:  { cipher_text_response }\n\n\n"
)

public_key_response = utils.get_public_key()
# print("Public Key: ", public_key_response)

open("./house_keeping.txt", "a").write(f"PUBLIC_kEY:  {public_key_response}\n\n\n")

"""

api_instance = developer_controlled_wallets.WalletSetsApi(client)
try:
    request = developer_controlled_wallets.CreateWalletSetRequest.from_dict(
        {"name": "Mulot_Payments_Wallet_Set"}
    )
    response = api_instance.create_wallet_set(request)
    print(response)
except developer_controlled_wallets.ApiException as e:
    print("Exception when calling WalletSetsApi->create_wallet_set: %s\n" % e)


"""
result = utils.register_entity_secret_ciphertext(
    CIRCLE_API_KEY,
    ENTITY_SECRET,
    os.path.join(Path(__file__).parent),
    "https://api.circle.com",
)
"""
