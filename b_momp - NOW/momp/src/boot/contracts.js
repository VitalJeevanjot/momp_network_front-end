export default async ({ app }) => {
  app.config.globalProperties.$contract_code = 
  `contract interface OracleConnector =
    payable entrypoint query : (string, bool) => string
    entrypoint getAnswer : (bytes(32)) => option(string)
    entrypoint canCallBack: () => bool
    entrypoint getBaseFee: () => int
    entrypoint getNextQueryID: () => string

contract interface OraclesManager =
    entrypoint getAddress : (string) => address
    entrypoint setContractOracle : (string) => bool
    entrypoint getContractOracle : (address) => string
    entrypoint getListOfOracles : () => list(string)

namespace Say =

    record setup = {
        oracle_address: OraclesManager,
        oracle_connector: OracleConnector
      }
    // Must run this to select oracle at init
    public function setOracle(oracle_id: string) : bool =
        let _oracle_address : OraclesManager = ct_2fkS2UefdAtrD4gmpYcQbujQJU3iaR1B7FPikeZWQ4xUxqbWhu
        _oracle_address.setContractOracle(oracle_id)
    
    public function getOracleId() : string =
        let _oracle_address : OraclesManager = ct_2fkS2UefdAtrD4gmpYcQbujQJU3iaR1B7FPikeZWQ4xUxqbWhu
        _oracle_address.getContractOracle(Call.caller)

    public function set() : setup =
        let _oracle_address : OraclesManager = ct_2fkS2UefdAtrD4gmpYcQbujQJU3iaR1B7FPikeZWQ4xUxqbWhu
        let _oracle_connector : OracleConnector = Address.to_contract(_oracle_address.getAddress(getOracleId()))
        
        {oracle_address = _oracle_address, oracle_connector = _oracle_connector}
    
    public function getOracleAddress() : address =
        set().oracle_address.getAddress(getOracleId())

    public function canCallBack() : bool =
        set().oracle_connector.canCallBack()
    
    public function getBaseFee() : int =
        set().oracle_connector.getBaseFee()

    public function getNextQueryID() : string =
        set().oracle_connector.getNextQueryID()

    public function getAnswer(query_id: bytes(32)) : option(string) =
        set().oracle_connector.getAnswer(query_id)

    stateful function query(args: string, require_callback: bool, value_received: int) : string =
        set().oracle_connector.query(args, require_callback, value = value_received)

    public function availableOracles() : list(string) =
        set().oracle_address.getListOfOracles()

contract Boolean =
  record boolean = {
    ok: bool
   } 






include "String.aes"

payable main contract Momp =

    datatype event = AeSent(address, int, int, string) 
                     | AeInContract(address, int, int, string)
                     | RegisteredEmail(bytes(32))
                     | EditedEmail(bytes(32))
                     | VerifiedEmail(bytes(32))
                     | EditedVerifiedEmail(bytes(32))

    record state = {
        is_registration_fee_paid: map(bytes(32), bool),
        email_to_public_addresses : map(bytes(32), address), 
        email_to_otp : map(bytes(32), bytes(32)), 
        edited_email_to_public_addresses : map(bytes(32), address), 
        edited_email_to_otp : map(bytes(32), bytes(32)), 
        otp_verified : map(bytes(32), bool),
        new_otp_verified : map(bytes(32), bool),
        amount_not_withdrawn: map(bytes(32), int),
        payment_sender_to_payment_ids: map(address, list(string)),
        payment_receiver_to_payment_ids: map(bytes(32), list(string)),
        payment_id_expiry: map(string, map(address, int)),
        payment_id_refund_claimed: map(string, bool),
        payment_id_payment_claimed: map(string, bool),
        payment_id_to_sender_and_amount: map(string, map(address, int)),
        payment_id_to_receiver: map(string, bytes(32)),
        payment_id_to_base_fee: map(string, int),
        owner: address,
        fees_collected: int,
        registration_fee: int,
        base_fee: int,
        time_for_refund_in: int}

    stateful entrypoint init() =
        Say.setOracle("oracle_smtp") 
        { email_to_public_addresses = {},
            email_to_otp = {},
            edited_email_to_public_addresses = {},
            edited_email_to_otp = {},
            otp_verified = {},
            new_otp_verified = {},
            amount_not_withdrawn = {},
            payment_sender_to_payment_ids = {},
            payment_receiver_to_payment_ids = {},
            payment_id_expiry = {},
            payment_id_refund_claimed = {},
            payment_id_payment_claimed = {},
            payment_id_to_sender_and_amount = {},
            payment_id_to_receiver = {},
            payment_id_to_base_fee = {},
            owner = Call.caller,
            fees_collected = 0,
            is_registration_fee_paid = {},
            registration_fee=10000000000000000,
            base_fee = 50000000000000000,
            time_for_refund_in = 1296000000 // 15 days
            }
    
    payable stateful entrypoint pay_registration_fee (email_to_register : bytes(32)) =
        require(Call.value == state.registration_fee, String.concat("The registration fee is: ", Int.to_str(state.registration_fee)))
        put(state{is_registration_fee_paid[email_to_register] = true})
        put(state{fees_collected @ c = c + state.registration_fee })

    payable stateful entrypoint _one() : bool =
        true

    stateful entrypoint add_email(email: bytes(32), pub_address: address, otp_encr: bytes(32)) : bool =
        if(Map.member(email, state.email_to_public_addresses) == false)
            register_email_one_time(email, pub_address,otp_encr)
        else
            queue_edit_email(email, pub_address, otp_encr)

    stateful function register_email_one_time(email: bytes(32), pub_address: address, otp_encr: bytes(32)) : bool =
        require(Call.caller == state.owner, "011: You are not authorized!")
        require(isVerifiedEmail(email) == false, "012: The email is already verified! You need to change is seperately!")
        require(state.is_registration_fee_paid[email] == true, "013: Registration fee not paid!")
        require(!Map.member(email, state.email_to_public_addresses), "014: Already tried to register once! Use edit method now.")
        put(state{email_to_public_addresses[email] = pub_address})
        put(state{email_to_otp[email] = otp_encr})
        put(state{otp_verified[otp_encr] = false})
        Chain.event(RegisteredEmail(email))
        true


    stateful entrypoint verify_otp(email: bytes(32), otp: string) : bool =
        let otp_to_otpencr = Crypto.sha256(String.concat(String.concat(Bytes.to_str(email), otp), Address.to_str(state.email_to_public_addresses[email])))
          
        require(Map.member(otp_to_otpencr, state.otp_verified), "015: Not existing OTP!")
        require(state.otp_verified[otp_to_otpencr] == false, "016: OTP already verified")
        require(state.email_to_otp[email] == otp_to_otpencr, "017: Otp not matched with initial OTP!")
        put(state{otp_verified[otp_to_otpencr] = true})
        put(state{is_registration_fee_paid[email] = false})
        Chain.event(VerifiedEmail(email))
        true

    public entrypoint get_sha256(email: bytes(32)) : bytes(32) =
        Crypto.sha256(Bytes.to_str(email))
    
    public entrypoint from_bytes_get_string(email: bytes(32)) : string =
        Bytes.to_str(email)
    
    public entrypoint concat_get_string(email: bytes(32), otp: string) : string =
        String.concat(String.concat(Bytes.to_str(email), otp), Address.to_str(state.email_to_public_addresses[email]))
    
    public entrypoint address_to_string(addr: address) : string =
        Address.to_str(addr)

    public entrypoint test_otp_creation(email: bytes(32), otp: string) : bytes(32) =
        Crypto.sha256(String.concat(String.concat(Bytes.to_str(email), otp), Address.to_str(state.email_to_public_addresses[email])))

    public entrypoint getNextQueryID() : string =
        Say.getNextQueryID()

    payable stateful entrypoint send_money(email_to: bytes(32), query_data: string) : string =
        require(Call.value > state.base_fee, "Must send something > basefee for a call!")
        let base_fee : int = Say.getBaseFee()
        let query_id = Say.query(query_data, false, base_fee)
        if(isVerifiedEmail(email_to))
            let user_address : address = Map.lookup_default(email_to, state.email_to_public_addresses, Contract.address)
            require(user_address != Contract.address, "018: The address you looking for does not exist")
            require(Address.is_payable(user_address), "019: Address cannot be paid!")
            Chain.spend(user_address, (Call.value - state.base_fee) - base_fee)
            put(state{payment_id_payment_claimed[query_id] = true})
            Chain.event(AeSent(Call.caller, (Call.value - state.base_fee) - base_fee, Chain.timestamp, Bytes.to_str(email_to)))
        
        else
            Chain.event(AeInContract(Call.caller, Call.value, Chain.timestamp, Bytes.to_str(email_to)))
            put(state{payment_id_payment_claimed[query_id] = false})
            put(state{payment_id_to_receiver[query_id] = email_to })
            put(state{amount_not_withdrawn[email_to = 0] @ c = c + ((Call.value - state.base_fee) - base_fee) })

        put(state{fees_collected @ c = c + state.base_fee })
        put(state{payment_sender_to_payment_ids[Call.caller = []] @ k = query_id :: k})
        put(state{payment_receiver_to_payment_ids[email_to = []] @ k = query_id :: k})
        put(state{payment_id_expiry[query_id] = {[Call.caller] = Chain.timestamp + state.time_for_refund_in}})
        put(state{payment_id_to_base_fee[query_id] = (state.base_fee + base_fee)})
        put(state{payment_id_to_sender_and_amount[query_id] = {[Call.caller] = ((Call.value  - state.base_fee) - base_fee)}})
        query_id


    public entrypoint isVerifiedEmail(email_to : bytes(32)) : bool =
        if(Map.lookup_default(Map.lookup_default(email_to, state.email_to_otp, #000000000000000000000000000000000000000000000000000000000000000), state.otp_verified, false) == true)
            true
        else
            false

    public entrypoint isEditedVerifiedEmail(email_to : bytes(32)) : bool =
        if(Map.lookup_default(Map.lookup_default(email_to, state.edited_email_to_otp, #000000000000000000000000000000000000000000000000000000000000000), state.new_otp_verified, false) == true)
            true
        else
            false

    stateful entrypoint claim_refund(payment_id: string) : string =
        require(state.payment_id_expiry[payment_id][Call.caller] < Chain.timestamp, "Transaction not expired yet!")
        let get_receiver = state.payment_id_to_receiver[payment_id]
        put(state{payment_id_refund_claimed[payment_id] = true})
        put(state{amount_not_withdrawn[get_receiver] @ c = c - (state.payment_id_to_sender_and_amount[payment_id][Call.caller]) })
        require(state.amount_not_withdrawn[get_receiver] > 0, "Cannot claim funds from 0 balance!")
        Chain.spend(Call.caller, state.payment_id_to_sender_and_amount[payment_id][Call.caller])
        put(state{payment_id_to_sender_and_amount[payment_id] = {[Call.caller] = 0}})
        "Amount claimed"



    
    stateful entrypoint set_base_fee(new_base_fee: int) : int =
        require(Call.caller == state.owner, "020: You are not authorized!")
        put(state{base_fee = new_base_fee})
        state.base_fee
    
    
    stateful entrypoint set_registration_fee(new_reg_fee: int) : int =
        require(Call.caller == state.owner, "021: You are not authorized!")
        put(state{registration_fee = new_reg_fee})
        state.registration_fee

    public entrypoint clients_balance(email_unregistered: bytes(32)): int =
        state.amount_not_withdrawn[email_unregistered]
    
    public entrypoint clients_pub_key(email: bytes(32)): address =
        state.email_to_public_addresses[email]

    public entrypoint clients_new_pub_key(email: bytes(32)): address =
        state.edited_email_to_public_addresses[email]
    
    stateful entrypoint clients_withdraw(email_address: bytes(32)) : int =
        require(isVerifiedEmail(email_address), "023: Email not verified!")
        let user_address = Map.lookup_default(email_address, state.email_to_public_addresses, Contract.address)
        require(user_address != Contract.address, "024: Address not found!")
        Chain.spend(user_address, state.amount_not_withdrawn[email_address])
        put(state{amount_not_withdrawn[email_address] = 0 })
        state.amount_not_withdrawn[email_address]

    stateful entrypoint owner_withdraw(addr: address, amount: int) : int =
        require(Call.caller == state.owner, "025: You are not authorized!")
        require(amount =< state.fees_collected, "026: Cannot withdraw more than fee collected!")
        put(state{fees_collected @ c = c - amount})
        Chain.spend(addr, amount)
        state.fees_collected

    public entrypoint contract_balance() : int =
        require(Call.caller == state.owner, "027: You are not authorized!")
        Contract.balance
    
    public entrypoint fees_collected() : int =
        require(Call.caller == state.owner, "028: You are not authorized!")
        state.fees_collected

    stateful function queue_edit_email(email_to_edit: bytes(32), new_pub_address: address, otp_encr: bytes(32)) : bool =
        require(Call.caller == state.owner, "029: You are not authorized!")
        require(state.is_registration_fee_paid[email_to_edit] == true, "030: Registration fee not paid!")
        put(state{edited_email_to_public_addresses[email_to_edit] = new_pub_address})
        put(state{edited_email_to_otp[email_to_edit] = otp_encr})
        put(state{new_otp_verified[otp_encr] = false})
        Chain.event(EditedEmail(email_to_edit))
        true

    stateful entrypoint registration_fee_paid(email: bytes(32)) : bool =
        require(Call.caller == state.owner, "0x01: You are not authorized!")
        put(state{is_registration_fee_paid[email] = true})
        state.is_registration_fee_paid[email]

    stateful entrypoint registration_fee_used(email: bytes(32)) : bool =
        require(Call.caller == state.owner, "0x02: You are not authorized!")
        put(state{is_registration_fee_paid[email] = false})
        state.is_registration_fee_paid[email]


    stateful entrypoint verify_and_edit_email_with_otp(email_to_edit: bytes(32), otp: string) : bool =
        require(Call.caller == state.email_to_public_addresses[email_to_edit],"You are not owner of this email!")
        let otp_to_otpencr = Crypto.sha256(String.concat(String.concat(Bytes.to_str(email_to_edit), otp), Address.to_str(state.edited_email_to_public_addresses[email_to_edit])))
        require(Map.member(otp_to_otpencr, state.new_otp_verified), "031: Not existing OTP!")
        require(state.new_otp_verified[otp_to_otpencr] == false, "032: OTP already verified")
        require(state.edited_email_to_otp[email_to_edit] == otp_to_otpencr ,"033: Otp not matched with initial OTP!")
        put(state{email_to_public_addresses[email_to_edit] = state.edited_email_to_public_addresses[email_to_edit]})
        put(state{email_to_otp[email_to_edit] = otp_to_otpencr})
        put(state{new_otp_verified[otp_to_otpencr] = true})
        put(state{otp_verified[otp_to_otpencr] = true})
        put(state{is_registration_fee_paid[email_to_edit] = false})
        Chain.event(EditedVerifiedEmail(email_to_edit))
        true
    
    stateful entrypoint set_time_for_refund_in(new_time: int) : int =
        require(Call.caller == state.owner, "034: You are not authorized!")
        put(state{time_for_refund_in = new_time})
        state.time_for_refund_in

    public entrypoint get_all_payment_ids_to_all_senders_and_amounts () : list(string * map(address, int)) =
        Map.to_list(state.payment_id_to_sender_and_amount)
    
    public entrypoint get_all_payment_receivers_to_payment_ids() :  map(bytes(32), list(string)) =
        state.payment_receiver_to_payment_ids
    
    public entrypoint get_payment_sender_from_payment_id (payment_id: string) : list(address * int) =
        Map.to_list(state.payment_id_to_sender_and_amount[payment_id])
   
    public entrypoint get_base_fee_from_payment_id (payment_id: string) : int =
        state.payment_id_to_base_fee[payment_id]

    public entrypoint get_payment_id_to_receiver (payment_id: string) : bytes(32) =
        state.payment_id_to_receiver[payment_id]

    public entrypoint get_payment_sender_to_payment_ids(sender: address) : list(string) =
        state.payment_sender_to_payment_ids[sender]

    public entrypoint get_payment_receiver_to_payment_ids(email: bytes(32)) : list(string) =
        state.payment_receiver_to_payment_ids[email]
    
    public entrypoint get_registration_fee_paid_or_not(email: bytes(32)) : bool =
        state.is_registration_fee_paid[email]
        
    public entrypoint get_block_time () : int = 
        Chain.timestamp

    public entrypoint get_base_fee () : int = 
        state.base_fee

    public entrypoint get_registration_fee () : int = 
        state.registration_fee
    
    public entrypoint get_time_for_refund_in () : int = 
        state.time_for_refund_in

    public entrypoint get_time_for_refund_in_for_payment_id (payment_id: string, sender: address) : option(int) = 
        Some(state.payment_id_expiry[payment_id][sender])

    public entrypoint get_account_balance(addr: address) : int =
        Chain.balance(addr)
    
    public entrypoint get_block_height() : int =
        Chain.block_height
    
    public entrypoint get_smtp_connector_base_fee() : int =
        Say.getBaseFee()
  `
  app.config.globalProperties.$contract_address = 'ct_2uJthb5s1D8c8F8ZYMAZ6LYGWno5ubFnrmkkHLE1FBzN3JruQw'
}